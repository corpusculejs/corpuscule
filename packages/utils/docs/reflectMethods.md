# @corpuscule/utils/lib/reflectMethods

This module provides tools to extract existing methods of the object with
fallbacks to use later.

## Usage

This module provides tools to work with restrictions of the Custom Elements
spec.

## Usage

Install the package via one of the following command:

```bash
$ npm install @corpuscule/utils
```

or

```bash
$ yarn add @corpuscule/utils
```

Then import it:

```typescript
import reflectMethods from '@corpuscule/utils/lib/reflectMethods';
```

## API

### reflectMethods

```typescript
function noop(): void {}

type Reflection<O, F, K extends PropertyKey> = {
  [P in K]: P extends keyof O
    ? Exclude<O[P], undefined>
    : P extends keyof F
    ? Exclude<F[P], undefined>
    : typeof noop;
};

function reflectMethods<
  O,
  F extends Record<K, Function>,
  K extends PropertyKey
>(
  object: O & Partial<Record<K, Function>>,
  methodNames: K[],
  fallbacks?: Partial<Exact<F, Record<K, Function>>>,
): Reflection<O, F, K>;
```

Extracts all methods mentioned in `methodNames` from the `object`, puts them
together into the separate object and returns it. If the method does not exist
in the `object`, the function from the `fallbacks` under the same name
will be used. If there is no appropriate element in the `object` or the
`fallbacks`, the method will be a `noop` function.

```typescript
class Foo {
  public foo() {
    console.log('foo called');
  }
}

class Bar extends Foo {
  public bar() {
    console.log('bar called');
  }
}

const fallbacks = {
  baz() {
    console.log('baz called');
  },
};

const bar = new Bar();

const reflection = reflectMethods(bar, ['foo', 'bar', 'baz', 'boo'], fallbacks);

reflection.foo(); // foo called
reflection.bar(); // bar called
reflection.baz(); // baz called
reflection.boo(); // <nothing happens>
```

##### Parameters

- **object**: _object_ - an object with methods to reflect.
- **methodNames**: _PropertyKey[]_ - a list of names of methods to extract.
- <sub>[optional]</sub> **fallbacks**: _object_ - a list of fallback functions
  to replace methods which are missing in the `object`.

##### Returns

**Types**: _object_

An object that has a method for all keys mentioned in the `methodNames` array.
Method could be an originl method (both own or inherited), a fallback or a noop
function.
