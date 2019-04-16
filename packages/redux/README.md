> ## 🛠 Status: In Development
> This package is currently under heavy development. Feedback is always welcome, but be careful with
using it in production. API is not ready yet and can receive large changes.

# @corpuscule/redux
[![Latest Stable Version](https://img.shields.io/npm/v/@corpuscule/redux.svg)](https://www.npmjs.com/package/@corpuscule/redux)
[![Package size](https://badgen.net/bundlephobia/minzip/@corpuscule/redux)](https://bundlephobia.com/result?p=@corpuscule/redux)

A lightweight set of decorators for providing [Redux](https://redux.js.org/) support for web
components. 

## Features
* **Small**. According to [Bundlephobia](https://bundlephobia.com), it has following sizes:
  * [![Package size](https://badgen.net/bundlephobia/min/@corpuscule/redux)](https://bundlephobia.com/result?p=@corpuscule/redux)
  * [![Package size](https://badgen.net/bundlephobia/minzip/@corpuscule/redux)](https://bundlephobia.com/result?p=@corpuscule/redux)
* **Typed**. [Typescript](http://www.typescriptlang.org/) typings are included.

## Installation
```bash
$ npm install --save redux @corpuscule/redux
``` 
or
```bash
$ yarn add redux @corpuscule/redux
```

## API
### Default
#### `@provider: ClassDecorator`
[See the `@corpuscule/context` docs on `@provider` decorator](../context/README.md#providertoken-token-classdecorator).
Redux store should be sent.

#### `@api: PropertyDecorator`
[See the `@corpuscule/context` docs on `@value` decorator](../context/README.md#valuetoken-token-propertydecorator).

#### `@redux: ClassDecorator`
It is a [`@consumer` decorator](../context/README.md#consumertoken-token-classdecorator) of
`@corpuscule/context` that receives store sent by `@provider`. Decorator provides API to access the
store instance with `@unit` and `@dispatcher` property decorators.

**Note**: applying `@api` here is unnecessary and will cause an error.

#### `@unit<S extends ReduxState>(getter: (state: S) => unknown): PropertyDecorator`
Extracts value from the store on each store update via getter and saves it in property if property
value and store value are not equal.

You can mark any type of property: string, symbolic or private.

#### `@dispatcher: PropertyDecorator`
Makes class element a redux dispatcher. It works for both instance and prototype fields, so it is
possible to bind bare action creators as well as class methods.

You can mark any type of property: string, symbolic or private.

#### `isProvider(target: unknown): boolean`
[See the `@corpuscule/context` docs on `isProvider`](../context/README.md#isprovider-token-token-target-unknown--boolean).

### Advanced
Using a set of advanced decorators allows creating a new context that is completely independent of
the default one.

#### How it works
[See `@copruscule/context` docs](../context/README.md#how-it-works).

#### `createReduxToken(): Token`
The function creates a token to bind `@provider`, `@redux`, `@api`, `@unit` and `@dispatcher`
together. To make a connection, you have to send a token to all these decorators as an argument.

#### `@providerAdvanced(token: Token): ClassDecorator`
[See default `@provider` decorator](#provider-classdecorator).

#### `@apiAdvanced(token: Token): PropertyDecorator`
[See default `@api` decorator](#api-propertydecorator).

#### `@reduxAdvanced(token: Token): ClassDecorator`
[See default `@redux` decorator](#redux-classdecorator).

#### `@unitAdvanced<S extends ReduxState>(token: Token, getter: (state: S) => unknown): PropertyDecorator`
[See default `@unit` decorator](#units-extends-reduxstategetter-state-s--unknown-propertydecorator).

#### `@dispatcherAdvanced(token: Token): PropertyDecorator`
[See default `@dispatcher` decorator](#dispatcher-propertydecorator).

#### `isProviderAdvanced(token: Token, target: unknown): boolean`
[See default `isProvider` function](#isprovidertarget-unknown-boolean).

## Example
```html
<script type="module">
  import {api, dispatcher, provider, redux, unit} from '@corpuscule/redux';
  import {configureStore} from './store';
  import {bazActionCreator} from './reducer';
  
  @provider
  class Provider extends HTMLElement {
    @api store = configureStore();
    
    constructor() {
      super();
      this.attachShadow({mode: 'open'});
    }
    
    connectedCallback() {
      this.shadowRoot.innerHTML = '<slot></slot>';
    }
  }
  customElements.define('x-provider', Provider);
  
  @redux
  class Consumer extends HTMLElement {
    _foo;
    
    @unit(state => state.foo) 
    get foo() {
      return this._foo; 
    }
    
    set foo(value) {
      this._foo = value;
      this.fooElement.textContent = value;
    }
    
    @dispatcher
    bar() {
      return this._foo.toString();
    }
    
    @dispatcher baz = bazActionCreator;
   
    get fooElement() {
      return this.shadowRoot.querySelector('.foo');
    }
    
    get runElement() {
      return this.shadowRoot.querySelector('.run');
    }
    
    constructor() {
      super();
      this.attachShadow({mode: 'open'});
    }
    
    connectedCallback() {
      this.shadowRoot.innerHTML = `
        <div class="foo"></div>
        <button class="run">Run</button>
      `;
      
      this.runElement.addEventListener('click', () => {
        this.bar();
        this.baz();
      });
    }
  }
  customElements.define('x-consumer', Consumer);
</script>
<x-provider>
  <x-consumer></x-consumer>
</x-provider>
```