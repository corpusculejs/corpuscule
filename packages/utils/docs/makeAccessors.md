# makeAccessors

This module provides tools to transform property descriptors to accessor
descriptors.

## Usage

```typescript
import makeAccessor from '@corpuscule/utils/lib/makeAccessor';
```

## API

### makeAccessors

```typescript
function makeAccessor(
  descriptor: PropertyDescriptor & {initializer?: () => unknown},
  initializers: Array<(self: object) => void>,
): Required<Pick<PropertyDescriptor, 'get' | 'set'>> & Omit<PropertyDescriptor, 'get' | 'set'>;
```

Converts the regular property to an accessor and registers the initializer
to set the initial value. If the received descriptor already belongs to an
accessor, it will be returned as is.

##### Parameters

- `descriptor` - a property or an accessor descriptor.
- `initializers` - an array of functions to register the initial value
  initializer.

##### Returns

An accessor descriptor of the property with `get` & `set` properties set.
