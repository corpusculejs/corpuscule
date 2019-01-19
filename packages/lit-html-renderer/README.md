# @corpuscule/lit-html-renderer
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

## API
#### renderRegular(result: TemplateResult, container: Element | DocumentFragment, context: unknown): void
Renderer function to use in `createElementDecorator` function of `@corpuscule/element` package.
Renders `result` receiving directly from `render` method to a `container`. Uses only native 
technologies. 

#### renderShady(result: TemplateResult, container: Element | DocumentFragment, context: unknown): void
Renderer function to use in `createElementDecorator` function. Works exactly as `renderRegular`, but
has support for [Shady DOM](https://www.polymer-project.org/blog/shadydom).

## Example
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

  