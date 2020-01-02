# @corpuscule/utils/lib/makeAccessors

This module provides tools to transform property descriptors to accessor
descriptors.

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
import makeAccessor from '@corpuscule/utils/lib/makeAccessor';
```

## API

### makeAccessors

```typescript
function makeAccessor(
  descriptor: PropertyDescriptor & {initializer?: () => unknown},
  initializers: Initializer[],
): Required<Pick<PropertyDescriptor, 'get' | 'set'>> &
  Omit<PropertyDescriptor, 'get' | 'set'>;
```

Converts the regular property to an accessor and registers the initializer
to set the initial value. If the received descriptor already belongs to an
accessor, it will be returned as is.

##### Parameters

- **descriptor**: _Babel [PropertyDescriptor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty#Description)_ -
  a property or an accessor descriptor.
- **initializers**: _[Initializer](../../typings/docs/index.md#initializer)[]_ -
  an array of functions to register the function to execute during the class
  instantiation.

##### Returns

**Type**: _[PropertyDescriptor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty#Description)_

An accessor descriptor of the property with `get` & `set` properties set.
