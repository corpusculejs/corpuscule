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

See [TemplateResult](https://lit-html.polymer-project.org/api/classes/lit_html.templateresult.html)
for details.