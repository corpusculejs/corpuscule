# @corpuscule/lit-html-renderer

This module provides tools to render the [element](../../element/docs/index.md)
content via the [lit-html](https://lit-html.polymer-project.org) library.

## Usage

Install the package via one of the following command:

```bash
$ npm install @corpuscule/lit-html-renderer
```

or

```bash
$ yarn add @corpuscule/lit-html-renderer
```

Then import it:

```typescript
import render from '@corpuscule/lit-html-renderer';
```

## API

### renderRegular

```typescript
function renderRegular(
  result: TemplateResult,
  root: Element | DocumentFragment,
  context: unknown,
): void;
```

A function that runs the regular lit-html [render](https://lit-html.polymer-project.org/api/modules/lit_html.html#render)
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
