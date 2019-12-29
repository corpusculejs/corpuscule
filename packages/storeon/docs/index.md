# @corpuscule/storeon

This module provides a [Storeon](https://github.com/storeon/storeon) connector
for web components.

## Usage

Install the package via one of the following command:

```bash
$ npm install @corpuscule/storeon
```

or

```bash
$ yarn add @corpuscule/storeon
```

Then import it:

```typescript
import {createStoreonToken, dispatcher, gear, provider, storeon} from '@corpuscule/storeon';
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
function dispatcher(eventName?: PropertyKey): PropertyDecorator;
```

A default version of the [@dispatcherAdvanced](#dispatcheradvanced) with the
token already provided.

#### provider

```typescript
const provider: ClassDecorator;
```

A default version of the [@providerAdvanced](#provideradvanced) with the token
already provided.

#### storeon

```typescript
const storeon: ClassDecorator;
```

A default version of the [@storeonAdvanced](#storeonadvanced) with the token
already provided.

#### unit

```typescript
function unit<S extends object>(storeKey: keyof S): PropertyDecorator;
```

A default version of the [@unitAdvanced](#unitadvanced) with the token already
provided.

#### dispatcherAdvanced

```typescript
function dispatcherAdvanced(token: Token, eventName?: PropertyKey): PropertyDecorator;
```

Converts a class method or field to a storeon dispatcher. There are three
possible types of the dispatcher:

- **Full dispatcher**. Literally, it is a `storeon.dispatch` method bound to a
  class property. To get it, omit the `eventKey` parameter while applying the
  decorator to a class field.

  Signature of the resulting method is the following:

  ```typescript
  (eventKey: PropertyKey, data: unknown) => void;
  ```

  **Example**

  ```typescript
  @storeon
  class StoreonComponent extends HTMLElement {
    @dispatcher() dispatch!: (eventKey: PropertyKey, data: number) => void;

    run(): void {
      this.dispatch('inc', 10);
    }
  }
  ```

- **Specified dispatcher**. It is a curried version of the `storeon.dispatch`
  with the predefined `eventKey`. To get it, send the `eventKey` parameter while
  applying the decorator to a class field.

  Signature of the resulting method is the following:

  ```typescript
  method(data: unknown): void;
  ```

  **Example**

  ```typescript
  @storeon
  class StoreonComponent extends HTMLElement {
    @dispatcher('inc') increase!: (data: number) => void;

    run() {
      this.increase(10);
    }
  }
  ```

- **Dispatcher-computer**. This kind of dispatcher calculates its value before
  dispatching and then acts like a [specified dispatcher](#specified-dispatcher).
  To get it, apply the decorator with provided `eventKey` parameter to a method.
  The result the method returns will be dispatched.

  **Example**

  ```typescript
  @storeon
  class StoreonComponent extends HTMLElement {
    @dispatcher('inc')
    increase(num1: number, num2: number): number {
      return num1 * num2;
    }

    run(): void {
      this.increase(10, 10);
    }
  }
  ```

##### Parameters

- **token**: _[Token](../../utils/docs/tokenRegistry.md#token)_ - a token issued
  by a [createStoreonToken](#createstoreontoken) function that connects all
  decorators in a single working system.

- **eventName**: _PropertyKey_ - a name of the event this dispatcher will
  trigger on call.

#### gearAdvanced

```typescript
function gearAdvanced(token: Token): PropertyDecorator;
```

Works similar to the `@value` context decorator

##### Extends

- [@value](../../context/docs/index.md#value).

#### providerAdvanced

Creates a Storeon store provider.

##### Extends

- [@provider](../../context/docs/index.md#provider).

#### storeonAdvanced

A decorator that makes a class declaration a Storeon provider with a store as
a context value.

> **Note**
>
> Do not use the [@gear](#gearadvanced) decorator for fields of the class
> declaration marked with this decorator. It will cause an error.

##### Extends

- [@consumer](../../context/docs/index.md#consumer).

##### Parameters

- **token**: _[Token](../../utils/docs/tokenRegistry.md#token)_ - a token issued
  by a [createStoreonToken](#createstoreontoken) function that connects all
  decorators in a single working system.

#### unitAdvanced

```typescript
function unitAdvanced<Store extends object>(token: Token, storeKey: keyof S): PropertyDecorator;
```

A decorator that makes a class property a reflection for the specific store
value. Whenever the value is changed, the property receives an update as
well.

```typescript
@storeon
class StoreonComponent extends HTMLElement {
  @unit('count') count!: number;
}
```

##### Type Paramters

- **Store**: _object_ - a storeon store type.

##### Parameters

- **token**: _[Token](../../utils/docs/tokenRegistry.md#token)_ - a token issued
  by a [createStoreonToken](#createstoreontoken) function that connects all
  decorators in a single working system.

- **storeKey**: _keyof `Store`_ - a key to extract a value to reflect from the
  store.

### Functions

#### createStoreonToken

```typescript
function createStoreonToken(): Token;
```

Creates tokens to bind decorators with each other.

##### Parameters

Nothing

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
