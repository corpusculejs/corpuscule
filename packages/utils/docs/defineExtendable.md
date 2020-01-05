# @corpuscule/utils/lib/defineExtendable

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
import defineExtendable from '@corpuscule/utils/lib/defineExtendable';
```

## API

### defineExtendable

```typescript
type BasicMethod = (this: any, ...args: any[]) => any;

function defineExtendable<
  C,
  B extends Record<PropertyKey, BasicMethod>,
  E extends B
>(
  klass: Constructor<C, Partial<B>>,
  baseClassMethods: B,
  extendedClassMethods: Exact<E, B>,
  initializers: Initializer[],
): void;
```

A workaround for a Corpuscule-decorated class inheritance. Corpuscule decorators
applied to a class override user-defined Custom Elements lifecycle hooks like
`connectedCallback` etc. creating an internal worker method which is necessary
for Corpuscule elements to work correctly. However, if the user wants to extend
the class, the wrapper is unnecessary and could cause undefined behavior and
harm the runtime execution.

This function is a solution to this problem. It replaces a lifecycle hook with a
wrapper that calls two different methods depending on whether the class is
extended or not. If the class is not extended, the Corpuscule worker is called;
otherwise, the original user-defined method is used.

##### Parameters

- **klass**: _[Constructor](../../typings/docs/Constructor.md)_ - a class
  declaration which lifecycle hooks should be redefined to be extendable.

- **basicMethods**: _object_ - an object with methods that should be used in
  case the class is not extended.

- **extendedMethods**: _object_ - an object with methods that should be used in
  case the class is extended. It should have methods with same signatures as
  `basicMethods` object.

- **initializers**: _[Initializer](../../typings/docs/index.md#initializer)[]_ -
  an array of functions to register the function to execute during the class
  instantiation.

##### Returns

Nothing.
