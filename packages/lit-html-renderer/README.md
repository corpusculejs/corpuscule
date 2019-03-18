> ## 🛠 Status: In Development
> This package is currently under heavy development. Feedback is always welcome, but be careful with
using it in production. API is not ready yet and can receive large changes.

# @corpuscule/lit-html-renderer
[![Latest Stable Version](https://img.shields.io/npm/v/@corpuscule/lit-html-renderer.svg)](https://www.npmjs.com/package/@corpuscule/lit-html-renderer)
[![Package size](https://badgen.net/bundlephobia/minzip/@corpuscule/lit-html-renderer)](https://bundlephobia.com/result?p=@corpuscule/lit-html-renderer)

Renderer for [`@corpuscule/element`](../element) based on the [`lit-html`](https://lit-html.polymer-project.org/)
library.

## Installation
```bash
$ npm install --save lit-html @corpuscule/lit-html-renderer
``` 
or
```bash
$ yarn add lit-html @corpuscule/lit-html-renderer
```

## Basic package
### API
#### `renderRegular(result: TemplateResult, container: Element | DocumentFragment, context: unknown): void`
Renderer function to use in `createElementDecorator` function of `@corpuscule/element` package.
Renders `result` receiving directly from `render` method to a `container`. Uses only native 
technologies. 

#### `renderShady(result: TemplateResult, container: Element | DocumentFragment, context: unknown): void`
Renderer function to use in `createElementDecorator` function. Works exactly as `renderRegular`, but
has support for [Shady DOM](https://www.polymer-project.org/blog/shadydom).

### Example
```html
<script type="module">
  import {attribute, createElementDecorator, lifecycle, render} from '@corpuscule/element';
  import renderer from '@corpuscule/lit-html-renderer';
  // or
  import renderer from '@corpuscule/lit-html-renderer/lib/shady';
  import {html} from 'lit-html';
  
  const element = createElementDecorator({renderer});
  
  @element('my-element')
  class MyElement extends HTMLElement {
    @attribute('mood')
    mood;
    
    @lifecycle
    render() {
      return html`
        <style>.mood { color: green; }</style>
        Web Components are <span class="mood">${this.mood}</span>!
      `;
    }
  }
</script>
<my-element mood="great"></my-element>
```

## withCustomElement
### API
#### withCustomElement(processor: typeof html): typeof html
This function is an extension for the `html` function of `lit-html`. It wraps the `html` processor
and adds new features to it. There are two basic features: 
* Static values are allowed. You have to import `unsafeStatic` function from the
`@corpuscule/lit-html-renderer/lib/withCustomElement` package, wrap a string you want to make unsafe and
then send it as a regular `lit-html` value to the function produced by `withCustomElement` wrapper.
* Custom elements are allowed. You can send any custom element as a regular `lit-html` value to the
function produced by `withCustomElement` wrapper, and they will be replaced with their names. 

To make any custom elements allowed, import `@corpuscule/lit-html-renderer/lib/init` as the first module
in the whole project of yours, e.g. somewhere in the root `index.js`.

#### unsafeStatic(value: unknown): UnsafeStatic
Use this function to mark your value as an unsafe static. It means that this value will be
stringified and merged into the `lit-html` string as a permanent static part. You won't be able to
change it after it is applied for the first time.

### Example
```javascript
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