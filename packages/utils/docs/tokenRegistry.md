# tokenRegistry

This module provides tools to connect separate decorators together.

## Usage

```typescript
import createTokenRegistry from '@corpuscule/utils/lib/tokenRegistry';
```

## API

### Token

```typescript
type Token = object;
```

A key to access specific data store in the registry.

The initial goal of the token design is to create an artificial closure for the
decorators which are, according to the [proposal](https://github.com/tc39/proposal-decorators/blob/master/README.md#semantic-details),
not JavaScript values and cannot be returned from a function or assigned to a
variable.

It is often necessary to bind together several decorators to build a complex
system on top of their interaction. The token access approach allows creating a
shared store which can be obtained using the token from inside the decorator.
The only thing user should do is to provide the same token for all decorators
that have to be linked with each other.

### createTokenRegistry

```typescript
function createTokenRegistry<Store>(
  createDataStore: () => Store,
  createRawToken?: TokenCreator,
): [() => Token, WeakMap<Token, Store>];
```

Creates:

- a key-value registry where the key is a unique token and the value
  is a data store;
- a `createToken` function to generate a token.

```typescript
const [createToken, registry] = createTokenRegistry<string[]>(() => []);

const token = createToken();

const arr = registry.get(token);

arr.push('test'); // ['test']
```

##### Parameters

- `createDataStore` - a function to create a new data store for the new token.
  The function will be called during the `createToken` function call.
- `createRawToken` - a function that will be used to generate a new token
  during the `createToken` call. It is optional, but you can use it to inherit
  an already existing token system. To do it, send the `createToken` you want
  to inherit as this argument.

##### Returns

A tuple which contains the new `createToken` function and the registry instance.
