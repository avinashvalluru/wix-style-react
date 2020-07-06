import classnames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import InfoIcon from '../InfoIcon';
import Text, { SIZES, SKINS, WEIGHTS } from '../Text';
import { dataHooks } from './constants';
import styles from './FormField.st.css';
import { TooltipCommonProps } from '../common/PropTypes/TooltipCommon';

const PLACEMENT = {
  top: 'top',
  right: 'right',
  left: 'left',
};

const ALIGN = {
  middle: 'middle',
  top: 'top',
};

const asterisk = (
  <div
    data-hook={dataHooks.asterisk}
    className={styles.asterisk}
    children="*"
  />
);

const charactersLeft = lengthLeft => {
  const colorProps =
    lengthLeft >= 0 ? { light: true, secondary: true } : { skin: SKINS.error };
  return (
    <Text
      size={SIZES.small}
      weight={WEIGHTS.normal}
      {...colorProps}
      dataHook={dataHooks.counter}
      children={lengthLeft}
    />
  );
};

class FormField extends React.Component {
  static displayName = 'FormField';
  static propTypes = {
    /**
     * any kids to render, should be some form of input. Input, InputArea & RichTextArea work well
     *
     * `children` can be React node or a function
     *
     * when function, it receives object with:
     * * `setCharactersLeft` - function accepts a number and will display it on top right of `FormField` component
     *
     * Note that alternatively you can also use `charCount` prop to display character count
     * instead of using the render function method.
     */
    children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),

    /** character count displayed on top right of the component */
    charCount: PropTypes.number,

    /** A custom element to appear on the end of the label row (it overrides the charCount in case it's provided) */
    suffix: PropTypes.node,

    /** Defines if the content (children container) grows when there's space available (otherwise, it uses the needed space only) */
    stretchContent: PropTypes.bool,

    /** optional text labeling this form field */
    label: PropTypes.node,

    /** setting label size (small, medium) */
    labelSize: PropTypes.oneOf(['small', 'medium']),

    /** label placement (top, left, right) */
    labelPlacement: PropTypes.oneOf([
      PLACEMENT.top,
      PLACEMENT.right,
      PLACEMENT.left,
    ]),

    /** label alignment  */
    labelAlignment: PropTypes.oneOf([ALIGN.middle, ALIGN.top]),

    /** whether to display an asterisk (*) or not */
    required: PropTypes.bool,

    /** display info icon with tooltip. Node from this prop is content of tooltip */
    infoContent: PropTypes.node,

    /** info icon tooltip props */
    infoTooltipProps: PropTypes.shape(TooltipCommonProps),

    /** string used to match text label with FormField children. For example:
     *
     * ```js
     * <FormField id="myFormField" label="Hello">
     *   <Input id="myFormField"/>
     * </FormField>
     * ```
     */
    id: PropTypes.string,

    /** used for testing */
    dataHook: PropTypes.string,
  };

  static defaultProps = {
    labelSize: 'medium',
    required: false,
    stretchContent: true,
    labelPlacement: PLACEMENT.top,
    labelAlignment: ALIGN.middle,
  };

  state = {
    lengthLeft: undefined,
  };

  childrenRenderPropInterface = {
    setCharactersLeft: lengthLeft => this.setState({ lengthLeft }),
  };

  _renderChildren() {
    const { children } = this.props;
    if (typeof children === 'function') {
      return children(this.childrenRenderPropInterface);
    }

    return children;
  }

  _hasCharCounter = () =>
    this.props.charCount !== undefined ||
    typeof this.state.lengthLeft === 'number';

  _renderCharCounter = () => {
    if (!this._hasCharCounter()) {
      return;
    }
    const { charCount } = this.props;
    return charactersLeft(
      charCount !== undefined ? charCount : this.state.lengthLeft,
    );
  };

  _renderInfoIcon = () => {
    const { dataHook, infoContent, infoTooltipProps, labelSize } = this.props;
    return (
      infoContent && (
        <InfoIcon
          dataHook={`${dataHook}-formfield-infoicon`}
          className={styles.infoIcon}
          content={infoContent}
          tooltipProps={infoTooltipProps}
          size={labelSize}
        />
      )
    );
  };

  _renderLabelIndicators = () => {
    const { required, children, suffix } = this.props;

    return (
      <div
        data-hook={dataHooks.labelIndicators}
        className={classnames(styles.labelIndicators, {
          [styles.minLabelHeight]: !children,
          [styles.inlineWithSuffix]: suffix || this._hasCharCounter(),
        })}
      >
        {this._renderLabel({ trimLongText: false })}
        {required && asterisk}
        {this._renderInfoIcon()}
      </div>
    );
  };

  _renderSuffix = () => {
    const { suffix } = this.props;

    return (
      (suffix || this._hasCharCounter()) && (
        <div data-hook={dataHooks.suffix} className={styles.suffix}>
          {suffix ? suffix : this._renderCharCounter()}
        </div>
      )
    );
  };

  _hasInlineLabel = (label, labelPlacement) =>
    label &&
    (labelPlacement === PLACEMENT.left || labelPlacement === PLACEMENT.right);

  _renderLabel = ({ trimLongText }) => {
    const { label, labelSize, id } = this.props;

    return (
      <Text
        size={labelSize}
        htmlFor={id}
        tagName={'label'}
        dataHook={dataHooks.label}
        ellipsis={trimLongText}
        style={{ display: 'block' }} // allows the label to middle vertically
        secondary
      >
        {label}
      </Text>
    );
  };

  render() {
    const {
      label,
      labelPlacement,
      labelAlignment,
      required,
      infoContent,
      dataHook,
      children,
      stretchContent,
    } = this.props;

    return (
      <div
        data-hook={dataHook}
        {...styles(
          'root',
          { labelPlacement, labelAlignment, stretchContent },
          this.props,
        )}
      >
        {label && labelPlacement === PLACEMENT.top && (
          <div
            className={classnames(styles.label, {
              [styles.minLabelHeight]: !children,
            })}
          >
            {this._renderLabel({ trimLongText: true })}
            {required && asterisk}
            {this._renderInfoIcon()}
            {this._renderSuffix()}
          </div>
        )}

        {children && (
          <div
            data-hook={dataHooks.children}
            className={classnames(styles.children, {
              [styles.childrenWithInlineLabel]:
                !label || this._hasInlineLabel(label, labelPlacement),
            })}
          >
            {(!label || labelPlacement !== PLACEMENT.top) &&
              this._renderSuffix()}
            {this._renderChildren()}
          </div>
        )}

        {!label && (required || infoContent) && this._renderLabelIndicators()}

        {this._hasInlineLabel(label, labelPlacement) &&
          this._renderLabelIndicators()}
      </div>
    );
  }
}

export default FormField;
