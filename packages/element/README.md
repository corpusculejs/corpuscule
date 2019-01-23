> ## 🛠 Status: In Development
> This package is currently under heavy development. Feedback is always welcome, but be careful with
using it in production. API is not ready yet and can receive large changes.

# `@corpuscule/element`
Lightweight set of decorators for creating web components. It is a decorator-based analogue for
Polymer's [LitElement](https://github.com/Polymer/lit-element) or a web components based view
rendering library like React or Vue. 

## Features
* **Zero third-party dependencies**. Package still contains Corpuscule dependencies, but no
third-party library is used.
* **Renderer agnostic**. You can use `@corpuscule/element` with any renderer you want: `lit-html`,
`hyperHTML`, `preact` or even `React`. Just choose an existing renderer or create a new one and send
it as a decorator option.
* **Small**. Only [2.9Kb gzipped](https://bundlephobia.com/result?p=@corpuscule/element@0.6.0).
* **Typed**. [Typescript](http://www.typescriptlang.org/) typings are included.

## Installation
```bash
$ npm install --save @corpuscule/element
``` 
or
```bash
$ yarn add @corpuscule/element
```

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

## Getting started
```html
<script type="module">
  import {attribute, createElementDecorator, render} from '@corpuscule/element';
  import renderer from '@corpuscule/lit-html-renderer';
  import {html} from 'lit-html';
  
  const element = createElementDecorator({renderer});
  
  @element('my-element')
  class MyElement extends HTMLElement {
    @attribute('mood')
    mood;
    
    [render]() {
      return html`
        <style>.mood { color: green; }</style>
        Web Components are <span class="mood">${this.mood}</span>!
      `;
    }
  }
</script>

<my-element mood="great"></my-element>
```

## Property Types
Corpuscule element contains three types of properties that differs in displaying, settings and
affecting the rendering process. 

### Attribute
The most well-known property type, it is also the most complex type to work with. Standard requires
that it should only be string type, but Corpuscule allows it to have three primitive type: `String`,
`Boolean` and `Number`. This type also has several features and limitations:
  * Attribute cannot have default value. This decision was made because creating element with
  attributes defined in constructor is [forbidden](https://html.spec.whatwg.org/multipage/custom-elements.html#custom-element-conformance)
  by standard. Setting attributes manually in `connectedCallback` is possible yet also limited,
  because component users can set these attributes before connection to DOM and would be upset 
  if default values override ones made by them. If you consider all these possibilities, you can
  set defaults in `connectedCallback` manually: it will require additional render for your
  component though.
  * Attribute are saved as strings in HTMLElement attributes storage, and whenever you request them,
  cast to proper type happens. That's the reason you cannot save in attribute more than just a
  primitive type.
  * It's not required for the attribute name to be equal to the property it is bound with. There is
  no restrictions for it.
  * Attributes are pure (in React meaning). It means that the old attribute value is compared with 
  the new one on set and if they are equal rendering won't happen.
  * Each attribute update calls `attributeChangedCallback` method with attribute name, old and new
  value. 
  * Each attribute update initiates rendering. 

### Property
Property is a simple element class property that has two main differences:
  * Property can be guarded by a function that checks its type. Since property can have any type,
  guarding them is a user's responsibility. If you don't care about checking property types, you 
  can omit guard.
  * Properties are pure (in React meaning). It means that the old property value is compared with 
  the new one on set and if they are equal, rendering won't happen.
  * Each property update calls `[propertyChangedCallback]` method with property name, old and new 
  value.
  * Each property update initiates rendering.

### Internal
Internal property is a property that works under the hood. They were planned as element internal
properties, so avoid sharing them and reusing outside of the class.

For React users this concept may be familiar as a [Component State](https://reactjs.org/docs/state-and-lifecycle.html).

Features: 
  * Internal properties are impure. Any change causes rendering.
  * Internal property doesn't have any guard on it.
  * Each internal property update calls `[internalChangedCallback]` with internal property name, old
  and new value.
  * Each internal property update initiates rendering.

### Other
You can also create regular class properties, but their change won't initiate rendering process 
unless you trigger any property of this three types. To cause rendering changing a property is the
only way. No request method is provided.

## Element Lifecycle
Each custom element marked with an `@element` decorator has following lifecycle. To be more
consistent, this description includes standard JS class and custom element lifecycle.

### Creation
It is possible to create custom element with `document.createElement` method, so this stage is
separate from others.

#### `constructor()`
**Hook Type**: JS Class

Everything starts with the creation of the custom element class.

#### `[createRoot](): Element | ShadowRoot`
**Hook Type**: Corpuscule

This method creates a root container that will be used in rendering method. By default it has
following implementation and just creates Shadow Root.
```typescript
[createRoot](): Element | ShadowRoot {
  return this.attachShadow({mode: 'open'});
}  
```
You can override it to, e.g., use element itself as a container (aka Light DOM) or to use as a
container specific element inside Shadow Root.

### Connecting
Element is considered connected when it appears in the current page DOM. **Note**: single element
could be connected multiple times.

#### `connectedCallback(): void`
**Hook Type**: Custom Element

This callback is called whenever element is connected to DOM. During the connection Corpuscule 
performs the initial rendering, and then user-defined `connectedCallback` is fired.

React users may consider it as a [`componentDidMount`](https://reactjs.org/docs/react-component.html#componentdidmount)
lifecycle hook.

#### `disconnectedCallback(): void`
**Hook Type**: Custom Element

This callback is called whenever element is disconnected from DOM. Since there is nothing for 
Corpuscule to do at this time, user-defined `disconnectedCallback` will be called directly.

React users may consider it as a [`componentWillUnmount`](https://reactjs.org/docs/react-component.html#componentwill)
lifecycle hook, but note that it is called **after** component is removed from DOM tree when
`componentWillUnmount` is called **before** it.

### Property Change
Depending on property of what type is changed different callback is called. You can read more about
property types at the section [Property Types](#property-types).

**Important Note**: Rendering system is able to wait until all properties are set and performs 
rendering only after it. So multiple rendering initiation doesn't cause rendering multiple times.
However, it is correct only for properties set synchronously. If some property is set during
asynchronous process, it will cause additional render. 

#### `attributeChangedCallback(attributeName: string, oldValue: string, newValue: string): void`
**Hook Type**: Custom Element

This callback is called each time [attribute](#attribute) is changed. It receives name of the
changed attribute, its old and new value. Do not check old and new values equality, Corpuscule
already does it and doesn't start user-defined `attributeChangedCallback` if values are equal. After
the user-defined callback is over the rendering starts.

#### `[propertyChangedCallback](propertyName: PropertyKey, oldValue: unknown, newValue: unknown): void`
**Hook Type**: Corpuscule

This callback is called each time [property](#property) is changed. It received name of the changed
property, its old and new value. The behavior is identical to `attributesChangedCallback` except for
receiving values type: old and new value have the type of current property and the property name
could be `string` or `symbol`.

#### `[internalChangedCallback](propertyName: PropertyKey, oldValue: unknown, newValue: unknown): void`
**Hook Type**: Corpuscule

This callback is called each time [internal property](#internal) is changed. It receives name of the
changed internal property, its old and new value. In contrast with other property callbacks, 
`[internalChangedCallback]` does not perform equality check.

#### `[updatedCallback](): void`
**Hook Type**: Corpuscule

This callback is called each time after the rendering is over except for the first time when 
`connectedCallback` is called instead.

React users may consider it [`componentDidUpdate`](https://reactjs.org/docs/react-component.html#componentdidupdate)
lifecycle hook.

### Rendering
This stage is performed almost without user control. Each component has it's own `scheduler` system
that schedules when it should be rendered. By default the [`@corpuscule/utils` scheduler](../utils/README.md#scheduler)
is used.

#### `[render](): unknown`
**Hook Type**: Corpuscule

Render function returns desired result in the format component renderer could work with. Renderer
receives nothing and could return anything which then will be send directly to the renderer
function.

## Features
### Inheritable
Basically, `@element` doesn't restrict working with JS OOP in any way. You can create any hierarchy
you want, extending both classes marked with `@element` and regular ones. Decorated elements in
that case will act as regular classes.

### Renderer Agnostic
As mentioned above, `@corpuscule/element` is renderer-agnostic, so you can to use any renderer
system you can put into a renderer function with the following signature.
```typescript
const renderer: <C, R>(result: R, container: Element | DocumentFragment, context: C) => void;
```
Here:
* `result: R` is a value returned by [`[render]`](#render-unknown) method. It is send to render
method directly, without any changes.
* `container: Element | DocumentFragment` is a html element where renderer should render `result`.
It is a value returned by [`[createRoot]`](#createroot-element--shadowroot) function, the root of
the element.
* `context: C` is an element instance. It could be used for different options, e.g. bining event
context in `lit-html`, or just omitted.

### Customized Built-In Element
Using the `@corpuscule/element` you are allowed to create not only regular Custom Element, but the
[Customized Built-In Element](https://developers.google.com/web/fundamentals/web-components/customelements#extendhtml)
as well. 

Customized Built-In Elements differs from regular Custom Elements in many ways. E.g., many native
elements cannot be extended by creating Shadow Root on them. It also means that for Customized
Built-In Elements it is not necessary to specify `[render]` hook in class.

To create Customized Built-In Element you have to:
* Specify `extends` option in the decorator
* Extend the proper class, e.g. `HTMLAnchorElement` for `<a>`.

##### Example
```javascript
@element('my-anchor', {extends: 'a'})
class MyAnchor extends HTMLAnchorElement {}
```

## API
This section describes decorators API and how to use them.

#### `createElementDecorator(options: ElementDecoratorOptions): ElementDecorator`
This function creates an element decorator. It is the main piece of the `@corpuscule/element`: it
brings other decorators together and unites them.

Creator function receives single `options` param which is an object that consists of following:
* `renderer: <C, R>(result: R, container: Element | DocumentFragment, context: C) => void`.
  Function that performs renderer operation for the element. More details at the [Renderer Agnostic](#renderer-agnostic)
  section. Specifying this function is required.
* `scheduler?: (callback: () => void) => Promise<void>`. Function that performs scheduling for your
  element. Specifying scheduler is not required, [`@corpuscule/utils` scheduler](../utils/README.md#scheduler)
  is used by default.
  
Creator function returns an `@element` decorator function that receives following params:
* `name: string`. The name of your Custom Element.
* `params: ElementDecoratorParams`. Object consists of following elements:
  * `extends?: keyof HTMLElementTagNameMap`. This parameter allows to create a
  [Customized Built-In Element](#customized-builtin-element) instead of a regular Custom Element.

##### Example
```javascript
import {createElementDecorator, render} from '@corpuscule/element';
import renderer from '@coruscule/lit-html-renderer';

const element = createElementDecorator({renderer}); 

@element('my-component')
class MyComponent extends HTMLElement {
  [render]() {
    return html`<div>Hello, World!</div>`
  }
}
```

#### `@attribute(name: string, guard: AttributeGuard): PropertyDecorator`
Attribute decorator binds class property to an attribute with the `name` and provides transformation
mechanism that allows to convert value with type described by `guard` to and from attribute string.
* `name`. Attribute name by which it can be set via `setAttribute` and get by `getAttribute`.
* `guard`. Constructor of one of three primitive types: `String`, `Boolean` or `Number`. It
describes transformation process for the attribute.

##### Example
```javascript
@element('my-button')
class MyButton extends HTMLElement {
  @attribute('disabled', Boolean)
  isDisabled;
  
  [render]() {
    return html`
      <button disabled=${this.isDisabled}><slot></slot></button>
      ${this.isDisabled ? html`<span>Button disabled</span>` : nothing}
    `;
  }
}
```
```html
<my-button disabled>Don't click me</my-button>
```

#### `@property(guard: (value: unknown) => boolean): PropertyDecorator`
Property decorator converts class property to an element property.
* `guard`. Function that checks received value to be proper type. Guards are inspired by [React
PropTypes](https://reactjs.org/docs/typechecking-with-proptypes.html) and should be used in a
similar way.

##### Example
```javascript
@element('my-square-info')
class MySquareInfo extends HTMLElement {
  @property(v => typeof v === 'object' && v.width && v.height)
  square = {width: 10, height: 10};
  
  [render]() {
    return html`
      <div>Square width: ${this.square.width}</div>
      <div>Square height: ${this.square.height}</div>
    `;
  }
}
```
```javascript
render(html`<my-square-info .square=${{width: 40, height: 40}}></my-square-info>`, document.body);
```

#### `@internal: PropertyDecorator`
Internal property decorator converts property to an element internal property. It receive no 
params and can be applied as is.

##### Example
```javascript
@element('my-square-info')
class MySquareInfo extends HTMLElement {
  @internal
  isOpen = false;
  
  handleOpen() {
    this.isOpen = !this.isOpen;
  }
  
  [render]() {
    return html`
      <button @click=${this.handleOpen}>Open modal</button>
      <some-modal ?open=${this.isOpen}></some-modal>
    `;
  }
}
```

#### `createComputingPair(): ComputingPair`
Function creates an object that contains a pair of bound decorators, `@observer` and `@computer`
that could be used to create computed properties.
* `@computer`. Applies to a single getter that computes something requiring other class properties
and depends on their values. Once applied, `@computer` calculates result on the first getter call,
memoizes it and then returns memoized result on next calls.
* `@observer`. Should be used to mark all dependencies required for the `@computed`. When they are
changed, `@observer` sets current computation state to "dirty", and then `@computer` has to
recalculate result on the next getter call and memoize it again.

One computing pair could be applied to any number of properties. They just should depend on the same
properties, because you cannot move `@observer`'s, and computed properties will be recalculated on
any change. 

Be accurate with [internal properties](#internal), they will change even if they have the same
value.

##### Example
```javascript
const calc = createComputingPair();

class Foo {
  @calc.observer
  bar = 1;
  
  @calc.observer
  baz = 2;

  @calc.computer
  get calculated() {
    return this.bar + this.baz
  }
}

const foo = new Foo();

const first = foo.calculated; // `calculated` is called
const second = foo.calculated; // `calculated` is not called

foo.bar = 2;

const third = foo.calculated; // `calculated` is called again because `foo.bar`
                              // is changed, and `calculated` depends on it
``` 

## Future
There is some plans for the future to improve this package.
* When the JS private properties are able to interact with decorators, all internal Symbols are
going to be rewritten to the `PrivateName`. It would improve encapsulation. Basically, it shouldn't
affect public API, because all changes should be done inside.
* There are also plans to create Babel plugin that will remove `guard`s from the production builds.
Since the source of inspiration for them were PropTypes, workflow should be the same: working during
development, removed in production.