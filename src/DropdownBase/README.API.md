# `<DropdownBase/>`

> A common dropdown mechanism using the Popover component

## Acceptable `children`

The `<DropdownBase/>` can accept two types of children:

* A regular React node, which will be rendered as-is.
* A function which returns a React node (a "render prop"). The function can accept a single
    arguments whose value is an object with the following properties:

  | Name | Type | Description |
  | ---- | ---- | ----------- |
  | `open(e)` | `Function` | A function that will open the items list. Can be called only when in "Uncontrolled" mode. |
  | `close(e)` | `Function` | A function that will close the items list. Can be called only when in "Uncontrolled" mode. |
  | `toggle(e)` | `Function` | A function that will toggle the items list. Can be called only when in "Uncontrolled" mode. |
  | `isOpen` | `Boolean` | Indicates whether the items list is currently open.  |
  | `delegateKeyDown(e)` | `Function` | The underlying `<DropdownLayout/>`'s `keydown` handler. It can be called inside another `keydown` event in order to delegate it (can be useful when using the "Controlled" mode). |
  | `selectedOption` | `{ id: any, value: any }`, `null` | The value of the selected option. |

**Note:** When calling a trigger function, make sure to provide the event to it in order to have the
best behaviour.

## Opening modes

You can use the `<DropdownBase/>`'s opening mechanism in 2 modes.

### Uncontrolled opening mode

In this mode you have access to the opening triggers, however the `<DropdownBase/>` component
still manage the visibility state of the items list by itself. You can access the triggers using a
render prop. For example, to create a basic dropdown that triggers on hover:

```jsx
<DropdownBase>
  {({ open, close, selectedOption }) => (
    <Button onMouseEnter={open} onMouseLeave={close}>
      {selectedOption ? `Selected item is ${selectedOption.value}` : 'Hove me'}
    </Button>
  )}
</DropdownBase>
```

In this mode, the `<DropdownBase/>` component will also handle the following:

* Keyboard navigation (opening the list with certain keys, navigating the list using the arrow keys,
    option selection)
* Closing the list when clicking outside of the component
* Closing the list when an option is selected

### Controlled opening mode

In this mode, it's up to you to decide when the list should be opened. You can control it using the
`open` prop. Note that you'll also need to manage keyboard navigation by yourself (the
`delegateKeyDown` function may be useful). Check the examples in "Usage" tab.

## Selection behaviour

You can use the `<DropdownBase/>`'s selection behaviour in 2 modes.

### Uncontrolled selection behaviour

In this mode, the `<DropdownBase/>` component will manage it's own state of the currently
selected option. You can retrieve the selected option in the render prop (via the `selectedOption`
property described above) using the `onSelect` callback prop. If you'd like to set an initially
selected option, use the `initialSelectedId` prop.

### Controlled selection behaviour

In this mode, the `<DropdownBase/>` component will update the selected option according to the
`selectedId` prop. In order to use this mode, you should pass both the `selectedId` and the
`onSelect` props, otherwise the uncontrolled behaviour will be used.

You'd typically want to update you own state of `selectedId` in the `onSelect` callback, then pass
this `selectedId` as a prop to the `<DropdownBase/>`.

----
