# @corpuscule/lit-html-renderer/lib/withCustomElement

## Usage

```typescript
import withCustomElement from '@corpuscule/lit-html-renderer/lib/withCustomElement';
```

## API

### UnsafeStatic

A value that's interpolated directly into the template before parsing.

Static values cannot be updated since they don't define a part and are
effectively merged into the literal part of a lit-html template. Because
they are interpolated before the template is parsed as HTML, static values
may occupy positions in the template that regular interpolations may not,
such as tag and attribute names.

UnsafeStatic values are inherently very unsafe, as the name states. They
can break well-formedness assumptions and aren't escaped, and thus a
potential XSS vulnerability if created from user-provided data.

It's recommended that no user templates ever use UnsafeStatic directly,
but directive-like functions are written by library authors to validate
and sanitize values for a specific purpose, before wrapping in an
UnsafeStatic value.

An example would be a `tag()` directive that lets a template contain tags
whose names aren't known until runtime, like:

```javascript
html`<${tag(myTagName)}>Whoa</${tag(MyElement)}>`;
```

Here, `tag()` should validate that `myTagName` is a valid HTML tag name,
and throw if it contains any illegal characters.

#### constructor

##### Parameters

- **value**: _unknown_ - a value you want to make static.

### unsafeStatic

```typescript
function unsafeStatic(value: unknown): UnsafeStatic;
```

Interpolates a value before template parsing and making it available to
template pre-processing steps.

Static values cannot be updated, since they don't define a part and are
effectively merged into the literal part of a lit-html template. Because
they are interpolated before the template is parsed as HTML, static values
may occupy positions in the template that regular interpolations may not,
such as tag and attribute names.

##### Parameters

- **value**: _unknown_ - a value you want to make static.

##### Returns

**Type**: _[UnsafeStatic](#unsafestatic)_

A value wrapped with UnsafeStatic.

### withCustomElement

```typescript
function withCustomElement(
  processor: (strings: TemplateStringsArray, ...values: unknown[]) => TemplateResult,
): (strings: TemplateStringsArray, ...values: unknown[]) => TemplateResult;
```

Decorates initial [html](https://lit-html.polymer-project.org/api/modules/lit_html.html#html)
function to produce preprocessed templates that include unsafe static values and
custom element classes.

No sanitization provided. Any static value is considered to be a string and
merged to a template, so it can lead to undefined behavior if you use angle
brackets or any other html-specific symbols.

Updating static values is impossible. If you try to replace one static value
with another, it will be ignored, and if it is a dynamic value, the error will
be thrown.

You can also send any custom element class as a value and its registered name
will be used as a tag name. The behavior of custom elements classes are equal to
the unsafe static values behavior.

```typescript
// index.js
import '@corpuscule/lit-html-renderer/lib/init';
import './app.js';

// app.js
import withCustomElement, {unsafeStatic} from '@corpuscule/lit-html-renderer';
import {html, render} from 'lit-html';

class Foo extends HTMLElement {}
customElements.define('x-foo', Foo);

const shtml = withCustomElement(html);
const barTag = unsafeStatic('x-bar');

render(shtml`
  <${Foo}>
    <${barTag}></${barTag}>
  </${Foo}>
`); // Will render <x-foo><x-bar></x-bar></x-foo>
```

##### Parameters

- **processor**: _Function_ - a [html](https://lit-html.polymer-project.org/api/modules/lit_html.html#html)
  function
  ```typescript
  (strings: TemplateStringsArray, ...values: unknown[]) => TemplateResult;
  ```

##### Returns

**Type**: _Function_

A decorated [html](https://lit-html.polymer-project.org/api/modules/lit_html.html#html)
function.

```typescript
(strings: TemplateStringsArray, ...values: unknown[]) => TemplateResult;
```
