> ## 🛠 Status: In Development
> This package is currently under heavy development. Feedback is always welcome, but be careful with
using it in production. API is not ready yet and can receive large changes.

# @corpuscule/storeon
[![Latest Stable Version](https://img.shields.io/npm/v/@corpuscule/storeon.svg)](https://www.npmjs.com/package/@corpuscule/storeon)
[![Package size](https://badgen.net/bundlephobia/minzip/@corpuscule/storeon)](https://bundlephobia.com/result?p=@corpuscule/storeon)

A lightweight set of decorators for providing [Storeon](https://github.com/ai/storeon) support for
web components.

## Features
* **Small**. According to [Bundlephobia](https://bundlephobia.com), it has following sizes:
  * [![Package size](https://badgen.net/bundlephobia/min/@corpuscule/storeon)](https://bundlephobia.com/result?p=@corpuscule/storeon)
  * [![Package size](https://badgen.net/bundlephobia/minzip/@corpuscule/storeon)](https://bundlephobia.com/result?p=@corpuscule/storeon)
* **Typed**. [Typescript](http://www.typescriptlang.org/) typings are included.

## Installation
```bash
$ npm install --save storeon @corpuscule/storeon
``` 
or
```bash
$ yarn add storeon @corpuscule/storeon
```

## API
### Default
#### `@provider: ClassDecorator`
[See the `@corpuscule/context` docs on `@provider` decorator](../context/README.md#providertoken-token-classdecorator).
Storeon store should be sent.

#### `@api: PropertyDecorator`
[See the `@corpuscule/context` docs on `@value` decorator](../context/README.md#valuetoken-token-propertydecorator).

#### `@storeon: ClassDecorator`
It is a [`@consumer` decorator](../context/README.md#consumertoken-token-classdecorator) of
`@corpuscule/context` that receives store sent by `@provider`. Decorator provides API to access the
store instance with `@unit` and `@dispatcher` property decorators.

**Note**: applying `@api` here is unnecessary and will cause an error.

#### `@unit<S extends object>(storeKey: keyof S): PropertyDecorator`
Updates the class property on each store update if the value is changed.

You can mark any type of property: string, symbolic or private.

#### `@dispatcher: PropertyDecorator`
Makes class element a storeon dispatcher. You can mark any type of property: string, symbolic or
private.

There are three types of dispatchers.

##### Full dispatcher.
Literally, it is a `storeon.dispatch()` bound to the class instance. Receives `eventKey` and `data`
params.
```javascript
@storeon
class StoreonComponent extends HTMLElement {
  @dispatcher() dispatch;
  
  run() {
    this.dispatch('inc', 10);
  }
}
```
##### Specified dispatcher.
It is a curried version of the `storeon.dispatch()` with predefined `eventKey`. It receives `data`
param. To get this kind of dispatcher, apply `@dispatcher` with a single argument.
```javascript
@storeon
class StoreonComponent extends HTMLElement {
  @dispatcher('inc') increase;
  
  run() {
    this.increase(10);
  }
}
```
##### Dispatcher-computer
This kind of dispatcher calculates its value before dispatching and then acts like [specified
dispatcher](#specified-dispatcher). To get this kind of dispatchers, apply `@dispatcher` to a
method.
```javascript
@storeon
class StoreonComponent extends HTMLElement {
  @dispatcher('inc') 
  increase(num1, num2) {
    return num1 * num2;
  }
  
  run() {
    this.increase(10, 10);
  }
}
```
#### `isProvider(target: unknown): boolean`
[See the `@corpuscule/context` docs on `isProvider`](../context/README.md#isprovider-token-token-target-unknown--boolean).

### Advanced
Using a set of advanced decorators allows creating a new context that is completely independent of
the default one.

#### How it works
[See `@copruscule/context` docs](../context/README.md#how-it-works).

#### `createStoreonToken(): Token`
The function creates a token to bind `@provider`, `@storeon`, `@api`, `@unit` and `@dispatcher`
together. To make a connection, you have to send a token to all these decorators as an argument.

#### `@providerAdvanced(token: Token): ClassDecorator`
[See default `@provider` decorator](#provider-classdecorator).

#### `@apiAdvanced(token: Token): PropertyDecorator`
[See default `@api` decorator](#api-propertydecorator).

#### `@storeonAdvanced(token: Token): ClassDecorator`
[See default `@storeon` decorator](#storeon-classdecorator).

#### `@unitAdvanced<S extends object>(token: Token, storeKey: keyof S): PropertyDecorator`
[See default `@unit` decorator](#units-extends-objectstorekey-keyof-s-propertydecorator).

#### `@dispatcherAdvanced(token: Token): PropertyDecorator`
[See default `@dispatcher` decorator](#dispatcher-propertydecorator).

#### `isProviderAdvanced(token: Token, target: unknown): boolean`
[See default `isProvider` function](#isprovidertarget-unknown-boolean).

## Example
```html
<script type="module">
  import {api, dispatcher, provider, storeon, unit} from '@corpuscule/storeon';
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
  
  @storeon
  class Consumer extends HTMLElement {
    _foo;
    
    @unit('foo') 
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