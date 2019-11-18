# ElementDecoratorOptions

```typescript
type ElementDecoratorOptions = {
  readonly extends?: keyof HTMLElementTagNameMap;

  readonly lightDOM?: boolean;

  readonly renderer?: (
    renderingResult: unknown,
    container: Element | DocumentFragment,
    context: unknown,
  ) => void;

  readonly scheduler?: (task: () => void) => Promise<void>;
}
```

#### extends

```
readonly extends?: keyof HTMLElementTagNameMap;
```

This option allows constructing the [Customized built-in element](https://developers.google.com/web/fundamentals/web-components/customelements#extendhtml).
Customized built-in elements differ from regular custom elements in many ways.
E.g., many native elements cannot be extended by creating Shadow Root on them;
by default, LightDOM will be created for these elements.

To create a customized built-in element, you also have to extend a proper class
(e.g. `HTMLAnchorElement` for `<a>`).

> **Note**
>
> Do not forget that Safari does not support a customized built-in element. So
> using this feature requires a polyfill.

```typescript
@element('my-anchor', {extends: 'a'})
class MyAnchor extends HTMLAnchorElement {}
```

##### List of native elements allowed to create the Shadow Root

- `<article>`
- `<aside>`
- `<blockquote>`
- `<body>`
- `<div>`
- `<footer>`
- `<header>`
- `<main>`
- `<nav>`
- `<p>`
- `<section>`
- `<span>`

#### lightDOM

```
readonly lightDOM?: boolean;
```

If this option is enabled, the [Light DOM](https://developers.google.com/web/fundamentals/web-components/shadowdom#lightdom)
will be used instead of the Shadow DOM; a result of the [render](#render)
function will be written directly to the element.

> ##### Warning
>
> Be careful, rendering to the Light DOM will erase any existing markup and make
> setting it from the outside buggy.

> **Note**
>
> This option is enabled automatically if Shadow Root is not allowed for this
> element. See [extends](#extends) option.

#### renderer

```
readonly renderer?: (
  renderingResult: unknown,
  container: Element | DocumentFragment,
  context: unknown,
) => void;
```

This option defines the rendering function that applies result returned from the
[render](#render) function to the component body.

If you omit this property, rendering won't ever happen on your element.

##### Parameters

- `renderingResult` - a result returned by a [render](#render) function.
- `container` - a component root to which result should be applied. It can be
  either the component shadow root or a component itself if the [lightDOM](#lightdom)
  is enabled.
- `context` - a component instance; it can be used in specific cases like
  setting the [eventContext](https://lit-html.polymer-project.org/api/interfaces/lit_html.renderoptions.html#eventcontext)
  of lit-html.

##### Returns

Nothing.

#### scheduler

```
readonly scheduler?: (task: () => void) => Promise<void>;
```

This option defines the function that schedules the rendering process. Since
each component renders independently and synchronously, it requires a scheduling
system to run the update at the right time and not freeze the user interface.
Using this option you can specify your own scheduling function instead of the
default one.

By default, the [schedule](../../utils/docs/scheduler.md#schedule) is used.

##### Parameters

- `task` - a callback that will be run at the scheduled time.

