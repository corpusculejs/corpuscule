# @corpuscule/lit-html-renderer

This module provides tools to render the [element](../../element/docs/element.md)
content via the [lit-html](https://lit-html.polymer-project.org) library.

## Usage

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
function for the component's root with the specific result of the [render](../../element/docs/element.md#render)
function.

See [TemplateResult](https://lit-html.polymer-project.org/api/classes/lit_html.templateresult.html)
for details.