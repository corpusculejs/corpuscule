# @corpuscule/utils/lib/shallowEqual

This module provides tools to compare object shallowly.

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
import shallowEqual from '@corpuscule/utils/lib/shallowEqual';
```

## API

### shallowEqual

```typescript
function shallowEqual<T1 extends any, T2 extends any>(
  objA: T1,
  objB: T2,
): boolean;
```

Compares two objects following the idea that one object is shallowly equal to
another if each property of this object is equal to each property of another.

```typescript
const objA = {foo: 1, bar: 2};
const objB = {foo: 1, bar: 2};
const objC = {foo: 1, baz: 2};

shallowEqual(objA, objB); // true
shallowEqual(objA, objC); // false
```

##### Type Parameters

- **T1**: _any_ - a type of the first object.
- **T2**: _any_ - a type of the second object.

##### Parameters

- **objA**: _T1_ - the first object to compare.
- **objB**: _T2_ - the second object to compare.

##### Returns

**Type**: _boolean_

The result of the comparison.
