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
This decorator converts class to a Redux provider and sends redux store of the property marked with
`@value` decorator down the DOM tree.

#### `@redux: ClassDecorator`
This decorator converts class to a Redux consumer. It receives store from the provider and binds it
to several properties and methods in class marked with `@connect` and `@dispatcher` decorators.

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
  import {connected, dispatcher, provider, redux, value} from '@corpuscule/redux';
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