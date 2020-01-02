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
function reflectMethods<
  PropertyName extends PropertyKey,
  ObjectToReflect extends Partial<Record<PropertyName, Function>>
>(
  objectToReflect: ObjectToReflect,
  methodNames: readonly PropertyName[],
  fallbacks: Partial<Record<PropertyName, Function>> = {},
): Record<PropertyName, Function>;
```

Extracts all methods mentioned in `names` from the `objectToReflect`, puts them
together into the separate object and returns it. If the method does not exist
in the `objectToReflect`, the function from the `fallbacks` under the same name
will be used. If there is no appropriate element in the `objectToReflect` or the
`fallbacks`, the method will be a noop function.

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

##### Type Parameters

- **PropertyName**: PropertyKey - a name of property that needs to be
  extendable.

- **ObjectToReflect**: object - a type of the object the function is applied to.

##### Parameters

- **object**: _ObjectToReflect_ - an object with methods to reflect.
- **methodNames**: _PropertyName[]_ - a list of names of methods to extract.
- <sub>[optional]</sub> **fallbacks**: _Partial<Record<PropertyName, Function>>_ -
  a list of fallback functions to replace methods which are missing in the
  `objectToReflect`.

##### Returns

**Types**: _Record<PropertyName, Function>_

An object that has a method for all keys mentioned in the `names` array. Method
could be an originl method (both own or inherited), a fallback or a noop
function.
