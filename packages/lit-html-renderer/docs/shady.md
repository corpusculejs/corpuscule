# @corpuscule/lit-html-renderer/lib/shady

This module provides tools to render the [element](../../element/docs/index.md)
content via the [lit-html](https://lit-html.polymer-project.org) library for the
older browsers that uses [Shady CSS](https://github.com/webcomponents/polyfills/tree/master/packages/shadycss)
polyfill.

## Usage

```typescript
import render from '@corpuscule/lit-html-renderer/lib/shady';
```

## API

### renderShady

```typescript
function renderShady(
  result: TemplateResult,
  root: Element | DocumentFragment,
  context: unknown,
): void;
```

A function that runs the shady lit-html [render](https://lit-html.polymer-project.org/api/modules/shady_render.html#render)
function for the component's root with the specific result of the [render](../../element/docs/index.md#render)
function.

##### Parameters

- **result**: _[TemplateResult](https://lit-html.polymer-project.org/api/classes/lit_html.templateresult.html)_ -
  a result of the component rendering.
- **container**: _Element | DocumentFragment_ - a component root to which result
  should be applied. Can be either `ShadowRoot` if Shadow DOM is enabled or the
  component itself is it is disabled.
- **context**: _unknown_ - a component instance; it can be used in specific
  cases like setting the [eventContext](https://lit-html.polymer-project.org/api/interfaces/lit_html.renderoptions.html#eventcontext)
  of lit-html.

##### Returns

Nothing.
