# @corpuscule/context

This module provides an interface to create a context for web components.

The context is a technique to share some data between one parent component and
its multiple descendants, no matter how deeply nested they are. This approach
reduces the complexity of the application because you no longer need to send
necessary properties through all the component tree to the desired descendant.

## Usage

Install the package via one of the following command:

```bash
$ npm install @corpuscule/context
```

or

```bash
$ yarn add @corpuscule/context
```

Then import it:

```typescript
import {createContextToken, consumer, provider, value} from '@corpuscule/context';
```

## How it works

The implementation of the context in this module works on an idea of [token
access](../../utils/docs/tokenRegistry.md#token). All you need to send a token
created with the [createContextToken](#createcontexttoken) function to
decorators you would like to link.

The module provides three decorators: [@provider](#provider), [@consumer](#consumer)
and [@value](#value). When you apply [@provider](#provider) decorator to a
component, it gets an ability to send the value of its field marked with
[@value](#value) decorator down the DOM branch. Component marked with [@consumer](#consumer)
decorator can receive this value in its field marked with [@value](#value)
during connection stage if it is a descendant of a provider component.

You also can:

- Use multiple contexts for a single DOM tree branch.
- Use single context for multiple DOM tree branches.

What does it mean? Let's imagine that we have two contexts, `A` and `B` and two
components that provide contexts down to the DOM tree, e.g., `a-provider` and
`b-provider`. Then you make `b-provider` a child of an `a-provider` and add a
couple of components as children of `b-provider`. These components now can
receive both `A` and `B` contexts if you make them consumers for these contexts.

Schema for this idea is following:

```
<!-- first branch -->
<a-provider>                               | A
  <b-provider>                             |    | B
    <my-component-1>                       |    |
      <my-component-2></my-component-2>    V    V
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

> **Note**
>
> You can link one [@provider](#provider) with only one [@consumer](#consumer).

> **Advice**
>
> To avoid sending token again and again you can create wrapping decorators for
> the single token.

## Example

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

### Decorators

#### @consumer

```typescript
function consumer(token: Token): ClassDecorator;
```

A decorator that makes the class declaration the context consumer. Now the
property of the class declaration marked with the [@value](#value)
becomes able to receive the shared date sent by a provider.

##### Parameters

- **token**: _[Token](../../utils/docs/tokenRegistry.md#token)_ - a token
  created by [createContextToken](#createcontexttoken) function.

#### @provider

```typescript
function provider(token: Token, defaultValue?: unknown): ClassDecorator;
```

A decorator that makes the class declaration the context provider. Now the
property of the class declaration marked with the [@value](#value)
becomes able to send the shared data down the DOM branch to consumers.

##### Parameters

- **token**: _[Token](../../utils/docs/tokenRegistry.md#token)_ - a token
  created by [createContextToken](#createcontexttoken) function.
- <sub>[optional]</sub> **defaultValue**: _unknown_ - if the [@value](#value)
  property is undefined, this value will be sent instead.

#### @value

```typescript
function value(token: Token): PropertyDecorator;
```

A service decorator that makes class property able to send or receive (depending
on the class-level decorator) the shared data. Each provider and consumer
requires to have one property marked with this decorator.

##### Parameters

- **token**: _[Token](../../utils/docs/tokenRegistry.md#token)_ - a token
  created by [createContextToken](#createcontexttoken) function. It should be
  the same for this decorator and the class-level one.

### Functions

#### createContextToken

```typescript
function createContextToken(): Token;
```

Creates tokens to bind decorators with each other.

##### Parameters

None

##### Returns

**Type**: _[Token](../../utils/docs/tokenRegistry.md#token)_

#### isProvider

```typescript
function isProvider(token: Token, klass: unknown): boolean;
```

Detects if the class declaration plays the provider role in the context system.

> **Note**
>
> If you use the wrong token the result will be negative even if the class
> declaration is the actual provider.

##### Parameters

- **token**: _[Token](../../utils/docs/tokenRegistry.md#token)_ - a token
  created by [createContextToken](#createcontexttoken) function and sent to the
  [@provider](#provider) decorator applied to the class declaration.
- **klass**: _unknown_ - a class declaration to check.

##### Returns

**Type**: _boolean_
