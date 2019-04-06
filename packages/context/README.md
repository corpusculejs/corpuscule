> ## 🛠 Status: In Development
> This package is currently under heavy development. Feedback is always welcome, but be careful with
using it in production. API is not ready yet and can receive large changes.

# `@corpuscule/context`
[![Latest Stable Version](https://img.shields.io/npm/v/@corpuscule/context.svg)](https://www.npmjs.com/package/@corpuscule/context)
[![Package size](https://badgen.net/bundlephobia/minzip/@corpuscule/context)](https://bundlephobia.com/result?p=@corpuscule/context)

A lightweight set of decorators for creating DOM-dependent context for web components.

Context is an approach to share some data for all components in a some DOM tree branch. It creates
a local state that is accessible from any component on any nesting level without direct forwarding
properties through the whole chain of children.

It was invented and popularized by [React](https://reactjs.org/docs/context.html).

This package also uses approach to implement context for web components suggested by Justin Fagnani
in [his talk](https://youtu.be/6o5zaKHedTE).

## Features
* **Zero third-party dependencies**. Package still contains Corpuscule dependencies, but no
third-party library is used.
* **Framework agnostic**. You can use package with any Web Components compatible framework/library.
* **Small**. According to [Bundlephobia](https://bundlephobia.com), it has following sizes:
  * [![Package size](https://badgen.net/bundlephobia/min/@corpuscule/context)](https://bundlephobia.com/result?p=@corpuscule/context)
  * [![Package size](https://badgen.net/bundlephobia/minzip/@corpuscule/context)](https://bundlephobia.com/result?p=@corpuscule/context)
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
`@corpuscule/context` works on an idea of token access. When you create a token, you also receive a
hidden connection that could bind together independent decorators. All you need to send this token
to decorators you would like to bind.

`@corpuscule/context` provides three decorators: `@provider`, `@consumer` and `@value`. When you
apply `@provider` decorator to a component, it gets an ability to send the value of its field marked
with `@value` decorator down the DOM tree. Component marked with `@consumer` decorator can receive
this value in its field marked with `@value` during connection stage if it is a descendant of a
provider component.

However, by default, `@provider` does not know to which `@consumer` it should send a value, and
`@value` cannot work properly with both of them. To connect all three of them you have to send the
same token created with `createContextToken` as the first argument to `@provider`, `@consumer` and
`@value` you want to link together. 

**Note**: You can link one `@provider` with only one `@consumer`.
**Note**: To avoid sending token again and again you can create wrapping decorators for the single
token.
```javascript
import {
  createContextToken,
  consumer as consumerAdvanced,
  provider as providerAdvanced,
  value as valueAdvanced,
} from '@corpuscule/context';
  
  const token = createContextToken();
  
  const consumer = consumerAdvanced(token);
  const provider = providerAdvanced(token);
  const value = valueAdvanced(token);
  
  @provider
  class Provider extends HTMLElement {
    @value providingValue = 10;
  }
  
  @consumer
  class Consumer extends HTMLElement {
    @value contextValue;
  }
```

You also can:
* Use multiple contexts for a single DOM tree branch.
* Use single context for multiple DOM tree branches.

What does it mean? Let's imagine that we have two contexts, **A** and **B** and two components that
provide contexts down to the DOM tree, e.g., `a-provider` and `b-provider`. Then you make
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
  import {createContextToken, consumer, provider, value} from '@corpuscule/context';
  
  const token = createContextToken();
  
  @provider(token)
  class Provider extends HTMLElement {
    @value(token) providingValue = 10;
  }
  
  @consumer(token)
  class Consumer extends HTMLElement {
    @value(token) contextValue;
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
##### `createContextToken(): Token`
The function creates a token to bind `@provider`, `@consumer` and `@value` together. To make a
connection, you have to send a token to all three decorators as an argument.

##### `@consumer(token: Token): ClassDecorator`
This decorator allows a custom class to receive context. The decorating class should be a descendant
of `@provider` class and have a field marked with `@value` decorator.

##### `@provider(token: Token): ClassDecorator`
This decorator allows a custom class to send context down the DOM tree. The decorating class should
have a field marked with `@value` decorator.

#### `@value(token: Token): PropertyDecorator`
This decorator converts the class property to a providing or context value (depending on a decorator
applied to a whole class). Using this decorator for provider and consumer is required. Only one
class field is allowed.

You can mark as a value properties of different types: string and symbolic. Private properties are
not supported yet.

#### `isProvider: (token: Token, target: unknown) => boolean`
Function to detect if class definition is marked with `@provider`. It also requires a token. 

```javascript
@provider(token)
class Provider extends HTMLElement {
}

assert(isProvider(token, Test) === true);
```
