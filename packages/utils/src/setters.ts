export const setArray: {
  <Key, Value>(
    store: Map<Key, Value[]>,
    key: Key,
    array: readonly Value[],
  ): void;
  <Key extends object, Value>(
    store: WeakMap<Key, Value[]>,
    key: Key,
    array: readonly Value[],
  ): void;
} = (
  store: Map<any, any> | WeakMap<object, any>,
  key: any,
  array: readonly any[],
) => {
  if (store.has(key)) {
    store.get(key).push(...array);
  } else {
    store.set(key, array);
  }
};

export const setObject: {
  <Key, Value extends object>(
    store: Map<Key, Value>,
    key: Key,
    object: Readonly<Partial<Value>>,
  ): void;
  <Key extends object, Value extends object>(
    store: WeakMap<Key, Value>,
    key: Key,
    object: Readonly<Partial<Value>>,
  ): void;
} = (store: Map<any, any> | WeakMap<object, any>, key: any, object: any) => {
  if (store.has(key)) {
    Object.assign(store.get(key), object);
  } else {
    store.set(key, object);
  }
};
