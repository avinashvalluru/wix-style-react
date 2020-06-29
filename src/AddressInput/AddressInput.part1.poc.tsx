import React from 'react';
import GooglePlacesAutoCompleteProvider, {
  getGeoCode,
} from 'google-places-auto-complete';
import GooglePlacesAutoCompleteAdapter from 'wsr-google-places-auto-complete-adapter';
import AddressInput from '../AddressInput';
import formattedDistance from './formattedDistance';
import RecentSearchesProvider from './RecentSearchesProvider';
import ClockIcon from 'wix-ui-icons-common/ClockIcon';
import Input from '../Input/Input';
import Text from '../Text';
import {
  DropdownLayoutOption,
  DropdownLayoutProps,
  DropdownLayoutValueOption,
} from '../DropdownLayout';

/**
 * This document is a summary of the thinking process i went through when i was faced with a task to create the
 * next version of WSR AddressInput component, an input component the can provide autocomplete suggestions for geo-location
 * addresses.
 */

/**
 * So let's start with what we had already defined, which is the visual specs of the new component (Zeplin).
 * Usually, this is not enough, in most of the times you will get to see there how the desired component should look like,
 * sometimes you will even get some "hints" for behaviour definitions and future capabilities.
 * But to be able to build a full product out of it we will need a better product definitions.
 * In our use case, since we had no product capacity at the time, we had to start with just that.
 *
 * At this point, you must be super careful when you are trying to convert your visual spec into a technical spec
 * by avoiding including into it any business logic and decision making. The way i like to think of it is like i am
 * building a marionette, i need it to be able to perform the "movements" required but i am not it's puppeteer.
 */

/**
 * <AddressInput/>
 * This is our "marionette" component, it's responsibility is to follow the product visual definitions and behaviour
 * guidelines, this way any consumer that wishes to build it's own address lookup solution will be able to reuse it and
 * only take care of his specific use cases.
 *
 * Due to that, we can already identify that some parts of this component must be strictly defined and others might provide
 * some flexibility to the consumer to alter the final result.
 * There is no defined formula to identify these different parts, usually i'll try to look on each piece of the component
 * and ask myself "is that how is should look/behave for all consumers? or only for some..." in case the answer is not trivial
 * try taking it with you UX designer or product manager to help you figuring it out.
 *
 * In the following suggested api, we can see our props divided into 3 different groups, we will see later how this
 * can provide us more clarity when composing with this component... */
class AddressInput extends React.PureComponent<AddressInputProps> {} // This can be a Function Component as well using hooks
interface AddressInputProps
  extends AddressInputBaseProps,
    AddressInputContentProps,
    AddressInputAppearanceProps {}

// The bare minimum api we want to expose to our users that provides a working product (required)
interface AddressInputBaseProps {
  // Technical props for external testing and styling capabilities
  dataHook?: string;
  className?: string;
  initialValue?: string;
  onSelect?(option: DropdownLayoutProps['onSelect']): void;
}
// Input and Options related props for managing internal values and getting updates upon changes.
interface AddressInputContentProps {
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onChangeDebounceWait?: number;
  onClear?: () => void;
  options?: DropdownLayoutOption[];
  status?: 'loading' | 'error' | 'warning';
}
// Visual related props, defining the component appearance & layout
interface AddressInputAppearanceProps {
  size?: 'small' | 'medium' | 'large';
  roundInput?: boolean;
  optionsLayout?: 'single-line' | 'double-line';
  showOptionsIcon?: boolean;
}
/**
 * Note, this component can be implemented in many ways, in this case we will probably use InputWithOptions internally to
 * gain the basic input+options behaviour done for us (hence some of the prop names are similar), this doesn't mean that
 * this component must mimic everything else of the internal component, we need to make sure that the tools we use to
 * compose this component doesn't enforce us to take decisions that we wouldn't take otherwise.
 * The component abstraction must stand by itself.
 * */

/*---------------------------------------------------------------------------------------------------------------------*/

/**
 * <GooglePlacesServiceProvider/>
 * Google Places is a service that provides autocomplete suggestions for a given user input, we want to encapsulate this
 * service into a provider component <GooglePlacesServiceProvider> which we will later use with our new <AddressInput/>
 * component to create the full <GoogleAddressInput/> solution.
 *
 * Let's see how an example of an api of such provider component...
 * Note: this api is inspired by a 3rd-party hook named `use-places-autocomplete` (just in a render-props fashion),
 * to read more about it you can go to https://github.com/wellyshen/use-places-autocomplete
 * */
class GooglePlacesServiceProvider extends React.PureComponent<{
  initialValue?: string;
  children?(props: ServiceProviderProps): JSX.Element;
}> {}
interface ServiceProviderProps {
  value?: string;
  setValue?(value: string): void;
  suggestions?: {
    data: Suggestion[];
    status: 'OK' | 'NOT_FOUND' | 'ZERO_RESULTS';
  };
  clearSuggestions?(): void;
}
interface Suggestion {} // This is the raw "suggestion" object returned from the google places service, untyped to reduce noise

/*---------------------------------------------------------------------------------------------------------------------*/

/**
 * So far we manged to define two building blocks required for our solution, one is the UI-Layer component <AddressInput/>
 * and the second is the ServiceProvider component <GooglePlacesServiceProvider/>
 * It is easy to see that these components "speaks a different language", the provider is not familiar with the UI-Layer API
 * and vise-versa.
 *
 * GooglePlacesService  -/->  AddressInput (service-api !== component-props)
 *
 * Therefore, we will need a middleware/adapter to make the two talk to each other.
 * Clarification, when speaking about middleware i will refer to function components that can apply transformations and
 * make side-effects on the props as long as it does not require any state.
 * Adapter is similar just with the addition it can have state.
 */

/**
 * <GooglePlacesServiceAdapter/>
 * a component that should act as a bridge between <GooglePlacesServiceProvider/> and <AddressInput/> components.
 * it should be familiar with the api of both ends and make sure that it is fulfilled correctly by receiving all the
 * the relevant data and handlers from the service provider and returning props that are aligned with UI-Layer props.
 *
 * Suggested api... */
class GooglePlacesServiceAdapter extends React.PureComponent<AdapterProps> {}
interface AdapterProps extends ServiceProviderProps {
  children?(props: AddressInputContentProps): JSX.Element;
}
/** Note that the `AddressInputAppearanceProps` are not part of the renderChildren signature, hence this is not the
 * responsibility of the adapter, we should be provided them to the component independently. */

/*---------------------------------------------------------------------------------------------------------------------*/

/** <GooglePlacesAddressInput/>
 * Let's put everything we defined so far together,
 * this component should fulfil our first milestone in the end product, an <AddressInput/> component that is
 * "powered by Google". */
interface GooglePlacesAddressInputProps
  extends AddressInputBaseProps,
    AddressInputAppearanceProps {}
const GooglePlacesAddressInput: React.FunctionComponent<GooglePlacesAddressInputProps> = ({
  initialValue: string,
  ...restAddressInputProps
}) => (
  <GooglePlacesServiceProvider initialValue={initialValue}>
    {(serviceProviderProps: ServiceProviderProps) => (
      <GooglePlacesServiceAdapter {...serviceProviderProps}>
        {(addressInputContentProps: AddressInputContentProps) => (
          <AddressInput
            {...addressInputContentProps}
            {...restAddressInputProps}
          />
        )}
      </GooglePlacesServiceAdapter>
    )}
  </GooglePlacesServiceProvider>
);
/**
 * This component is in fact taking the responsibility to fulfill the <AddressInput/> interface.
 * `AddressInputBaseProps` & `AddressInputAppearanceProps` are being exposed outside for the consumer to provide while
 * the `AddressInputContentProps` is being served internally by our Provider/Adapter duo and is not open for modification
 * from outside, we will see later how we can still provide "extending" capabilities that can modify these props
 * for additional features.
 * Now, i can see why the code above can be eye pleasing to some while mind bending to others, it is just for
 * demonstration purposes to shows the separation of concerns between all of our building blocks and the props
 * composition.
 * We can always consolidate the Provider/Adapter into a single component <GooglePlacesProvider/> resulting a code that
 * would look like...
 *
 * const GooglePlacesAddressInput: React.FunctionComponent<GooglePlacesAddressInputProps> =
 *   initialValue: string
 *   ...restAddressInputPro
 * }) =>
 *   <GooglePlacesProvider initialValue={initialValue}/>
 *     {(addressInputContentProps: AddressInputContentProps) =>
 *       <AddressInput {...addressInputContentProps} {...restAddressInputProps}/>
 *   </GooglePlacesProvider/>
 * );
 */
/*---------------------------------------------------------------------------------------------------------------------*/
/**
 * To conclude so far, we manged to split our problem into three parts, each one has a clear definition of responsibility
 * and a declared way to connect with the others, Provider -> Adapter -> UI.
 * The resulting component can display an input on the screen and provide auto complete suggestions for address accordingly.
 * In the next part we will see what type of products we can build with it and which additional building blocks we will
 * need to create to accommodate the new products needs...
 */