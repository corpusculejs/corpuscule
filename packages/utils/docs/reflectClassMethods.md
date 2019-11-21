# @corpuscule/utils/lib/reflectClassMetadata

This module provides tools to extract existing methods of the class to the
object to use later.

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
import reflectClassMethods from '@corpuscule/utils/lib/reflectClassMethods';
```

## API

### reflectClassMethods

```typescript
function reflectClassMethods<PropertyNames extends PropertyKey>(
  klass: any,
  methodNames: ReadonlyArray<PropertyNames>,
  fallbacks?: Partial<Record<PropertyNames, Function>>,
): Record<PropertyNames, Function>;
```

Extracts all methods mentioned in `names` from the `target`, puts them together
into the separate object and returns it. If the method does not exist in the
`target`, the function from the `fallbacks` under the same name will be used. If
there is no appropriate element in the `target` or the `fallbacks`, the method
will be a noop function.

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

const reflection = reflectClassMethods(bar, ['foo', 'bar', 'baz', 'boo'], fallbacks);

reflection.foo(); // foo called
reflection.bar(); // bar called
reflection.baz(); // baz called
reflection.boo(); // <nothing happens>
```

##### Parameters

- **klass**: _any_ - a class declaration prototype.
- **methodNames**: _PropertyNames[]_ - a list of names of methods to extract.
- <sub>[optional]</sub> **fallbacks**: _Partial<Record<PropertyNames, Function>>_ -
  a list of fallback functions to replace methods which are missing in the
  `target`.

##### Returns

**Types**: _Record<PropertyNames, Function>_

An object that has a method for all keys mentioned in the `names` array. Method
could be a target method (both own or inherited), a fallback function or a noop.
