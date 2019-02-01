> ## 🛠 Status: In Development
> This package is currently under heavy development. Feedback is always welcome, but be careful with
using it in production. API is not ready yet and can receive large changes.

# `@corpuscule/context`
[![Latest Stable Version](https://img.shields.io/npm/v/@corpuscule/context.svg)](https://www.npmjs.com/package/@corpuscule/context)

Lightweight set of decorators for creating DOM-dependent context for web components.

Context is an approach to share some data for all components in a some DOM tree branch. It creates
a local state that is accessible from any component on any nesting level without direct forwarding
properties through whole chain of children. 

It was invented and popularized by [React](https://reactjs.org/docs/context.html).

This package also uses approach to implement context for web components suggested by Justin Fagnani
in [his talk](https://youtu.be/6o5zaKHedTE).

## Features
* **Zero third-party dependencies**. Package still contains Corpuscule dependencies, but no
third-party library is used.
* **Framework agnostic**. You can use package with any Web Components compatible framework/library.
* **Small**. Only [1.3Kb gzipped](https://bundlephobia.com/result?p=@corpuscule/context@0.6.0)
* **Typed**. [Typescript](http://www.typescriptlang.org/) typings are included.

## Installation
```bash
$ npm install --save @corupuscule/context
```
or
```bash
$ yarn add @corupuscule/context
```

## How it works
`@corpuscule/context` provides a single function that creates provider-consumer decorators pair.
When you apply `@provider` decorator to a component, it gets an ability to send the value of its
field marked with `@value` decorator down the DOM tree. Component marked with `@consumer`
decorator is able to receive this value in its field marked with `@value` during connection stage
if it is a descendant of a provider component.

You also can:
* Use multiple contexts for a single DOM tree branch.
* Use single context for multiple DOM tree branches.

What does it mean? Let's imagine that we have two contexts, **A** and **B** and two components that
provides contexts down to the DOM tree, e.g., `a-provider` and `b-provider`. Then you make
`b-provider` a child of an `a-provider` and add a couple of components as children of
`b-provider`. These components now can receive both **A** and **B** contexts if you make them
consumers for these contexts.

Schema for this idea is following:
```
<!-- first branch -->
<a-provider>                               | A     
  <b-provider>                             |    | B
    <my-component-1>                       |    |  
       <my-component-2></my-component-2>   V    V  
    </my-component-1>                  
  </b-provider>                    
</a-provider>                      
<!-- second branch -->
<a-provider-2>                             | A     
  <my-component-1>                         |
    <my-component-2></my-component-2>      V
  </my-component-1>
</a-provider>
```

### Example
```html
<script type="module">
  import createContext from '@corpuscule/context';
  
  const {
    consumer,
    provider,
    value,
  } = createContext();
  
  @provider
  class Provider extends HTMLElement {
    @value
    providingValue = 10;
  }
  
  @consumer
  class Consumer extends HTMLElement {
    @value
    contextValue;
  }
  
  customElement.define('my-provider', Provider);
  customElement.define('my-consumer', Consumer);
  
  customElement.whenDefined('my-consumer').then(() => {
    const consumer = document.querySelector('my-consumer');
    assert(consumer.contextValue === 10);  
  });
</script>

<my-provider>
  <my-consumer></my-consumer>
</my-provider>
```

## API
#### `createContext<T>(defaultValue?: T): ContextTools`
Main function that creates provider-consumer decorators pair along with symbol properties they use. 
Returns `ContextTools` object.

#### `ContextTools`
##### `@consumer: ClassDecorator`
This decorator allows custom class to receive context. Decorating class should be a descendant of 
`@provider` class and have field marked with `@value` decorator.

##### `@provider: ClassDecorator`
This decorator allows custom class to send context down the DOM three. Decorating class should have
field marked with `@value` decorator.

#### `@value: PropertyDecorator`
This decorator converts class property to a providing or context value (depending on a decorator
applied to a whole class). Using this decorator for provider and consumer is required. Only one 
class field is allowed.

You can mark as a value any type of property: string, symbolic or private.

#### `isProvider: (target: unknown) => boolean`
Function to detect if class definition is marked with `@provider`.
```javascript
@provider
class Provider extends HTMLElement {
}

assert(isProvider(Test) === true);
```
