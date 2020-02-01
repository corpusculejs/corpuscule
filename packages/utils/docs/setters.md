# @corpuscule/utils/lib/setters

This module provides tools to change complex values (like objects and arrays)
in the `Map` or `WeakMap` store without explicit check for their existence.
If the value does not exist, it will be created.

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
import {setArray, setObject} from '@corpuscule/utils/lib/setters';
```

## API

### setArray

Adds new elements listed in the `array` parameter to the array in the `store`
under the `key`. If the array does not exist yet, it will be created.

##### Overload #1

```typescript
function setArray<K, V>(
  store: Map<K, V[]>,
  key: K,
  array: ReadonlyArray<V>,
): void;
```

This overload accepts `Map` instance as a store.

```typescript
const store = new Map<string, string[]>();

setArray(store, 'foo', ['bar']);
store.get('foo'); // ['bar']

setArray(store, 'foo', ['baz']);
store.get('foo'); // ['bar', 'baz']
```

##### Overload #2

```typescript
export function setArray<K extends object, V>(
  store: WeakMap<K, V[]>,
  key: K,
  array: ReadonlyArray<V>,
): void;
```

This overload accepts `WeakMap` instance as a store.

```typescript
const store = new WeakMap<object, string[]>();
const key = {};

setArray(store, key, ['bar']);
store.get(key); // ['bar']

setArray(store, key, ['baz']);
store.get(key); // ['bar', 'baz']
```

##### Type Parameters

- **K** - a type of the store key.
- **V** - a type of the store value.

##### Parameters

- **store**: _Map<K, V>_ - a `Map` instance which contains or should contain the
  target array.
- **key**: _K_ - a key to access the target array.
- **array**: _V_ - an array with new elements to add to the target array.

##### Returns

Nothing.

### setObject

Adds new properties listed in the `object` parameter to the object in the
`store` under the `key`. If the object does not exist yet, it will be created.

##### Overload #1

```typescript
function setObject<K, V extends object>(
  store: Map<K, V>,
  key: K,
  object: Readonly<Partial<V>>,
): void;
```

This overload accepts `Map` instance as a store.

```typescript
const store = new Map<string, Record<string, string>>();

setArray(store, 'foo', {bar: 1});
store.get('foo'); // {bar: 1}

setArray(store, 'foo', {baz: 2});
store.get('foo'); // {bar: 1, baz: 2}
```

##### Overload #2

```typescript
function setObject<K extends object, V extends object>(
  store: WeakMap<K, V>,
  key: K,
  object: Readonly<Partial<V>>,
): void;
```

This overload accepts `WeakMap` instance as a store.

```typescript
const store = new WeakMap<object, Record<string, string>>();
const key = {};

setArray(store, key, {bar: 1});
store.get(key); // {bar: 1}

setArray(store, key, {baz: 2});
store.get(key); // {bar: 1, baz: 2}
```

##### Type Parameters

- **K**: _object_ - a type of the store key.
- **V**: _object_ - a type of the store value.

##### Parameters

- **store**: _Map<K, V>_ - a `Map` instance which contains or should contain the target object.
- **key**: _K_ - a key to access the target object.
- **object**: _V_ - an object with new properties to add to the target object.

##### Returns

Nothing.
