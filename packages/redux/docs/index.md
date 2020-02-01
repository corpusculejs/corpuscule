# @corpuscule/redux

This module provides a [Redux](https://redux.js.org/) connector for web
components.

## Usage

Install the package via one of the following command:

```bash
$ npm install @corpuscule/redux
```

or

```bash
$ yarn add @corpuscule/redux
```

Then import it:

```typescript
import {dispatcher, provider, redux, unit} from '@corpuscule/redux';
```

## API

### Decorators

#### gear

```typescript
const gear: PropertyDecorator;
```

A default version of the [@gearAdvanced](#gearadvanced) with the token already
provided.

#### dispatcher

```typescript
const dispatcher: PropertyDecorator;
```

A default version of the [@dispatcherAdvanced](#dispatcheradvanced) with the
token already provided.

#### provider

```typescript
const provider: ClassDecorator;
```

A default version of the [@providerAdvanced](#provideradvanced) with the token
already provided.

#### redux

```typescript
const redux: ClassDecorator;
```

A default version of the [@reduxAdvanced](#reduxadvanced) with the token already
provided.

#### unit

```typescript
function unit<Store extends object>(
  getter: (state: Store) => any,
): PropertyDecorator;
```

A default version of the [@unitAdvanced](#unitadvanced) with the token already
provided.

#### dispatcherAdvanced

```typescript
function dispatcherAdvanced(token: Token): PropertyDecorator;
```

Converts a class method or field (with an action creator assigned) to a redux
[dispatcher](https://redux.js.org/api/store#dispatch). Redux will dispatch
everything the wrapped function returns.

```typescript
const someExternalAction = (value: string) => ({
  type: 'SOME_EXTERNAL_ACTION',
  payload: value,
});

@redux
class ReduxExample extends HTMLElement {
  @dispatch public fieldExample = someExternalAction;

  private secretNumber: number = 10;

  @dispatch
  public methodExample(value: number) {
    return {type: 'SOME_ACTION', payload: value + this.secretNumber};
  }
}
```

##### Parameter

- **token**: _[Token](../../utils/docs/tokenRegistry.md#token)_ - a token issued
  by a [createReduxToken](#createreduxtoken) function that connects all decorators
  in a single working system.

#### gearAdvanced

```typescript
function gearAdvanced(token: Token): PropertyDecorator;
```

Works similar to the `@value` context decorator.

##### Extends

- [@value](../../context/docs/index.md#value).

##### Parameter

- **token**: _[Token](../../utils/docs/tokenRegistry.md#token)_ - a token object
  issued by a [createReduxToken](#createreduxtoken).

#### providerAdvanced

```typescript
function providerAdvanced(token: Token, defaultValue?: unknown): ClassDecorator;
```

Makes class declaration a Redux store provider.

##### Extends

- [@provider](../../context/docs/index.md#provider).

#### reduxAdvanced

```typescript
function reduxAdvanced(token: Token): ClassDecorator;
```

Makes a class declaration a Redux store consumer.

> **Note**
>
> Do not use the [@gear](#gearadvanced) decorator for fields of the class
> declaration marked with this decorator. It will cause an error.

##### Extends

- [@consumer](../../context/docs/index.md#consumer).

##### Parameter

- **token**: _[Token](../../utils/docs/tokenRegistry.md#token)_ - a token issued
  by a [createReduxToken](#createreduxtoken) function that connects all
  decorators in a single working system.

#### unitAdvanced

```typescript
function unitAdvanced<Store extends object>(
  token: Token,
  getter: (state: Store) => any,
): PropertyDecorator;
```

Makes a class property a reflection for the specific store value. Whenever the
value is changed, the property receives an update as well.

```typescript
@redux
class ReduxExample extends HTMLElement {
  @unit(store => store.foo)
  public foo!: number;
}
```

##### Type parameters

- **Store**: _object_ - a type of the store object.

##### Parameters

- **token**: _[Token](../../utils/docs/tokenRegistry.md#token)_ - a token issued
  by a [createReduxToken](#createreduxtoken) function that connects all
  decorators in a single working system.
- **getter**: _Function_ - a function that extracts the value to reflect from
  the store.
  ```typescript
  (state: Store) => any;
  ```

### Functions

#### createReduxToken

```typescript
function createReduxToken(): Token;
```

Creates tokens to bind decorators with each other.

##### Parameters

Nothing.

##### Returns

**Type**: _[Token](../../utils/docs/tokenRegistry.md#token)_

#### isProvider

```typescript
function isProvider(klass: unknown): boolean;
```

A default version of the [@isProviderAdvanced](#isprovideradvanced) with the
token already provided.

#### isProviderAdvanced

```typescript
function isProviderAdvanced(token: Token, klass: unknown): boolean;
```

Detects if the class declaration is a [@provider](#provideradvanced).

##### Extends

- [isProvider](../../context/docs/index.md#isprovider).
