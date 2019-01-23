> ## 🛠 Status: In Development
> This package is currently under heavy development. Feedback is always welcome, but be careful with
using it in production. API is not ready yet and can receive large changes.

# @corpuscule/redux
Lightweight set of decorators for providing [Redux](https://redux.js.org/) support for web
components. 

## Features
* **Small**. Only [1.8Kb gzipped](https://bundlephobia.com/result?p=@corpuscule/redux@0.6.1)
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
#### `@provider: ClassDecorator`
[See the `@corpuscule/context` docs on `@provider` decorator](../context/README.md#provider-classdecorator).
Redux store should be sent.

#### `@value: PropertyDecorator`
[See the `@corpuscule/context` docs on `@value` decorator](../context/README.md#value-propertydecorator).

#### `@redux: ClassDecorator`
Basically it is [`@consumer` decorator](../context/README.md#consumer-classdecorator) of
`@corpuscule/context` that receives store sent by `@provider`. Decorator provides API to access the
store instance with `@unit` and `@dispatcher` property decorators.

**Note**: applying `@value` in this class unnecessary and will cause an error.

#### `@unit<S extends ReduxState>(getter: (state: S) => unknown): PropertyDecorator`
This decorator extracts value from the store on each store update using getter and saves it in
property if property value and store value are not equal.

You can mark any type of property: string, symbolic or private.

#### `@dispatcher: PropertyDecorator`
This decorator makes class element a redux dispatcher. It works for both own and prototype
fields, so it is possible to bind bare action creators as well as class methods.

You can mark any type of property: string, symbolic or private.

## Example
```html
<script type="module">
  import {dispatcher, provider, redux, unit, value} from '@corpuscule/redux';
  import {configureStore} from './store';
  import {bazActionCreator} from './reducer';
  
  @provider
  class Provider extends HTMLElement {
    @value store = configureStore();
    
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
    #foo;
    
    @unit(state => state.foo) 
    get foo() {
      return this.#foo; 
    }
    
    set foo(value) {
      this.#foo = value;
      this.fooElement.textContent = value;
    }
    
    @dispatcher
    bar() {
      return this.#foo.toString();
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