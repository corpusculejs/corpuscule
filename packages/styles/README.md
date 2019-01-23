> ## 🛠 Status: In Development
> This package is currently under heavy development. Feedback is always welcome, but be careful with
using it in production. API is not ready yet and can receive large changes.

# @corpuscule/styles
Lightweight decorator to add styles to web components. It also supports upcoming [Constructable
Stylesheets proposal](https://wicg.github.io/construct-stylesheets/).

## Symbolic names
During reading this documentation you can face many methods which signature contains square brackets
around the name. It means that they use symbolic values imported from the main package. E.g., for
`[foo]` it could be following import:
```javascript
import {foo} from 'some-package';

class Bar {
  [foo]() { // this is a symbolic field name
    return null;
  }
}
```

## How it works
This packages provides 4 approaches to work with styles. Let's range them in order they are
applying in code.

**Note**: By default `shadyCSS` and `adoptedStyleSheets` conditions are detected automatically, but
you can change scenario by using `createStylesDecorator` function that creates custom `@styles`
decorator.

### URL instance
You are able to use `URL` instance as a parameter for `@styles` decorator. This way, the `<link>`
tag with provided URL will be added to your `shadowRoot`. Styles added with `HTMLLinkElement` is
scoped, so it is a simplest way to provide styles for component.

However, it may not be the best, because loading CSS files is a time-consuming process, and until
that your component will not be styled properly. You can consider this approach as a development
one. Also you can use `[stylesAttachedCallback]` method, it will be fired right after all styles are
loaded.

**Note**: in future there is a plan to create simple Babel plugin that converts `URL` instances to
an `import` expressions that could be consumed by Webpack then. 

### ShadyCSS
ShadyCSS has support for Constructable Stylesheets so using ShadyCSS implies using Constructable
Stylesheet polyfill provided by it.

### Constructable Stylesheet
If Constructable Stylesheet is supported and no ShadyCSS is enabled (or native support is enabled),
it will be used.

### HTMLStyleElement
If nothing above works, decorator will add `<style>` tag as a first child of `ShadowRoot`.

## API
### External
#### `@style(...pathsOrStyles: Array<string | URL>): ClassDecorator`
This decorator applies algorithm described above to the marked class.

#### `createStylesDecorator(params: {adoptedStyleSheets: boolean, shadyCSS: boolean}): @style`
This function can be used to create custom [`@style`](#stylepathsorstyles-arraystring--url-classdecorator).
With this function you can adjust `adoptedStyleSheets` or `shadyCSS` support. 

### Internal
#### `[stylesAttachedCallback](): void`
This callback would be called just after the `HTMLStyleElement` is attached. It solves following
problem.

To add `HTMLStyleElement` `MutationObserver` is used. It is necessary to catch a moment when
`ShadowRoot` is filled for the first time, because otherwise any rendering engines (like
[`lit-html`](https://lit-html.polymer-project.org/) or [`React`](https://reactjs.org/)) will remove
everything during the first rendering. However, if new node is added __after__ the first rendering,
it will be preserved during following renderings.

However, `MutationObserver` is asynchronous, so if you need something to run __after__ styles are
connected, you have to use `[stylesAttachedCallback]`. You can also use it to catch a moment when 
all `URL` styles are downloaded.

For other approaches it will be called immediately after the `connectedCallback`.

## Example
`styles.css`
```css
.container {
  background: black;
  color: white;
}
```

```html
<script type="module">
  import styles, {stylesAttachedCallback} from '@corpuscule/styles'; 

  @styles(new URL('styles.css', import.meta.url))
  class MyElement extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({mode: 'open'});
    }
    
    [stylesAttachedCallback]() {
      this.shadowRoot.innerHTML = '<div class="container">Text</div>';
    }
  }
</script>
```