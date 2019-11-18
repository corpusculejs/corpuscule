# @corpuscule/element

This module provides tools to define web components in a declarative way.

## How it works

By default, web components are too low-level to define them directly. They
require too much boilerplate to create and support. This module provides special
decorators that allow setting main parts of web components in the most
declarative way possible. These decorators combined, create a component system
that works together and is easy to interact with.

There are the following decorators that makes the system work:

- [@attribute](#attribute),
- [@property](#property),
- [@internal](#internal).

## Element Lifecycle

See [Corpuscule Element Lifecycle Hooks](./hooks.md)).

## API

### Decorators

#### @attribute

```typescript
function attribute(
  attributeName: string,
  guard: BooleanConstructor | NumberConstructor | StringConstructor,
): PropertyDecorator;
```

A decorator that binds a class property to an appropriate attribute and provides
a transformation to the property value to and from the attribute string.

An attribute is the most well-known property type and also the most complex type
to work with. Standard requires that it should only be a string type, but
Corpuscule allows it to have three primitive types: `String`, `Boolean`, and
`Number`.

```html
<script type="module">
  @element('my-button', {renderer})
  class MyButton extends HTMLElement {
    @attribute('disabled', Boolean) isDisabled;

    [render]() {
      return html`
        <button disabled=${this.isDisabled}><slot></slot></button>
        ${this.isDisabled
          ? html`
              <span>Button disabled</span>
            `
          : nothing}
      `;
    }
  }
</script>
<my-button disabled>Don't click me</my-button>
```

##### Features and limitations

- The attribute cannot have a default value. The reason is that creating an
  element with attributes defined in a constructor is [forbidden](https://html.spec.whatwg.org/multipage/custom-elements.html#custom-element-conformance)
  by the standard. Setting attributes manually in `connectedCallback` is allowed
  yet also limited, because component users can set these attributes before
  connection to DOM and would be upset if default values override ones made by
  them. If you consider all these possibilities, you can set defaults in
  `connectedCallback` manually; it will require additional render for your
  component though.
- Attribute are saved as strings in `HTMLElement` attributes storage, and
  whenever you request them, cast to proper type happens. That's the reason you
  cannot save in attribute more than just a primitive type.
- It is not required for the attribute name to be equal to the property it is
  bound with. There are no restrictions for it.
- Attributes start the rendering only when the old and the new value are not
  equal. To find it out the simple strict equality check is performed.
- Each attribute update calls the `attributeChangedCallback` method with
  attribute name, old and new value.
- Each attribute update initiates rendering.

##### Parameters

- `attributeName` - a name of the attribute to bind.
- `guard` - a type of the property value that should be converted.

#### @computer

```typescript
function computer(token: Token): PropertyDecorator;
```

A decorator that transforms a class getter to a computed property. It is an
approach that can be used to reduce the number of expensive calculations by
remembering the latest result produced by the getter and providing it until all
the class properties the getter depends on are changed.

##### Parameters

- `token` - a token produced by a [createComputingToken](#createcomputingtoken)
  to bind this decorator with [@observer](#observer).

#### @element

```typescript
function element(name: string, options?: ElementDecoratorOptions): ClassDecorator;
```

A decorator that converts a class declaration to a Custom Element and unites
all other decorators making a complete working system from them.

```typescript
import {element, render} from '@corpuscule/element';
import renderer from '@coruscule/lit-html-renderer';

@element('my-component', {renderer})
class MyComponent extends HTMLElement {
  protected [render](): TemplateResult {
    return html`
      <div>Hello, World!</div>
    `;
  }
}
```

> **Note**
>
> New custom element definition with `@element` decorator is an
> asynchronous operation. You cannot use it immediately. If you need to do
> something with the element right after it is created, use the following
> approach:
>
> ```typescript
> @element('my-component', {renderer})
> class MyComponent extends HTMLElement {}
>
> customElements.whenDefined('my-component').then(() => {
>   const myComponent = new MyComponent();
> });
> ```

> **Advice**
>
> To avoid setting `renderer` each time you can create a wrapper decorator:
>
> ```javascript
> import {element as elementUniversal} from '@corpuscule/element';
> import renderer from '@coruscule/lit-html-renderer';
>
> const element = (name, options) => elementUniversal(name, {...options, renderer});
> ```

##### Parameters

- `name` - a name of the new Custom Element. According to the standard, it
  should contain a dash symbol.

- `options` (optional) - a list of options that tunes the custom element
  according to the requirements.
  - [ElementDecoratorOptions](./ElementDecoratorOptions.md).

#### @internal

```typescript
const internal: PropertyDecorator;
```

A decorator that transforms a class property to a component internal property.

An internal property is a property that works under the hood. Its role is to be
an intrinsic mechanism, so it would be better to avoid sharing and reusing it
outside of the class.

For React users, this concept may be familiar as a [Component State](https://reactjs.org/docs/state-and-lifecycle.html).

```typescript
@element('my-component-with-modal', {renderer})
class MyComponentWithModal extends HTMLElement {
  @internal private isOpen: boolean = false;

  private handleOpen(): void {
    this.isOpen = !this.isOpen;
  }

  private [render](): TemplateResult {
    return html`
      <button @click=${this.handleOpen}>Open modal</button>
      <some-modal ?open=${this.isOpen}></some-modal>
    `;
  }
}
```

##### Features and limitations

- Any change of the internal property initiates rendering; the equality check of
  the old and the new value is not performed.
- The internal property doesn't have any guard on it.
- Each internal property update calls [[internalChangedCallback]] with internal
  property name, old and new value.

#### @observer

```typescript
function observer(token: Token): PropertyDecorator;
```

A decorator that makes a class property observed. It works together with the
computed property created via [@computer](#computer) decorator to reset
the remembered getter result. When a value of one of the observed properties
is changed, the remembered result of the computed one is reset, and the next
call to the getter will start the recalculation which result will be
remembered again.

Each computed property will observe all the observed properties at once and
will drop the remembered result on any of their change.

> **Note**
>
> Be accurate with [internal properties](#internal), they will
> change (and invalidate the computation result) even if they have the same
> value.

##### Parameters

- `token` - a token produced by a [createComputingToken](#createcomputingtoken)
  to bind this decorator with [@computer](#computer).

#### @property

```typescript
function property(guard?: PropertyGuard): PropertyDecorator;
```

A decorator that converts a class property to a component regular property.

A regular property of the component is a property that can be set only
imperatively by assigning the component instance filed.

```typescript
@element('my-square-info', {renderer})
class MySquareInfo extends HTMLElement {
  @property(v => typeof v === 'object' && v.width && v.height)
  public square = {width: 10, height: 10};

  protected [render](): TemplateResult {
    return html`
      <div>Square width: ${this.square.width}</div>
      <div>Square height: ${this.square.height}</div>
    `;
  }
}

customElements.whenDefined('my-component').then(() => {
  const mySquareInfo = document.createElement('my-square-info');
  mySquareInfo.square = {width: 40, height: 40};
  document.body.append(mySquareInfo);
});
```

##### Features and limitations

- Property can be guarded by a function that checks its type. Since a
  property can have any type, guarding them is a user's responsibility. If you
  don't care about checking property types, you can omit the guard.
- Properties start the rendering only when the old and the new value are not
  equal. To find it out the simple strict equality check is performed.
- Each property update calls [propertyChangedCallback](#propertychangedcallback)
  method with property name, old and new value.
- Each property update initiates rendering.

##### Parameters

- `guard` (optional) - a function that checks the type of the assigned value; if
  it returns `false`, the error will be thrown.

#### @query

```typescript
function query(selector: string, options?: QueryOptions): PropertyDecorator;
```

A decorator that converts a property to a getter that finds an element with the
`selector` in the Light or Shadow DOM of your element using the `querySelector`
method.

By default the search is performed in the either Shadow DOM (if enabled) or
Light DOM (if Shadow DOM is disabled). However, you can force selector to search
in the Light DOM even if Shadow DOM is enabled. To achieve it, send a
`{ lightDOM: true }` option as the second parameter of the decorator.

```typescript
@element('my-element', {renderer})
class MyElement extends HTMLElement {
  @query('#target') private target: HTMLSpanElement;

  protected [render](): TemplateResult {
    return html`
      <div class="wrapper">
        <span id="target"></span>
      </div>
    `;
  }
}
```

##### Parameters

- `selector` - a selector of the desired element.
- `options` (optional) - a set of decorator options.
  - [QueryOptions](./QueryOptions.md).

#### @queryAll

```typescript
function queryAll(selector: string, options?: QueryOptions): PropertyDecorator;
```

A decorator that converts a property to a getter that finds all elements with
the `selector` in the Light or Shadow DOM of your element using the
`querySelectorAll` method.

By default the search is performed in the either Shadow DOM (if enabled) or
Light DOM (if Shadow DOM is disabled). However, you can force selector to search
in the Light DOM even if Shadow DOM is enabled. To achieve it, send a
`{ lightDOM: true }` option as the second parameter of the decorator.

```typescript
@element('my-element', {renderer})
class MyElement extends HTMLElement {
  @queryAll('.target') private targets: HTMLCollectionOf<HTMLSpanElement>;

  protected [render](): TemplateResult {
    return html`
      <div class="wrapper">
        <span class="target"></span>
        <span class="target"></span>
        <span class="target"></span>
      </div>
    `;
  }
}
```

##### Parameters

- `selector` - a selector of the desired set of elements.
- `options` (optional) - a set of decorator options.
  - [QueryOptions](./QueryOptions.md).

### Functions

#### createComputingToken

```typescript
function createComputingToken(): Token;
```

By default, [computed](#computer) and [observed](#observer) properties do not
know that they are connected. To link them with each other, you have to use a
token created via this function and send it to the decorators of computed and
observed properties you want to connect.

##### Returns

A [Token](../../utils/docs/tokenRegistry.md#token) object.
