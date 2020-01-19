export const setArray: {
  <K, V>(store: Map<K, V[]>, key: K, array: readonly V[]): void;
  <K extends object, V>(
    store: WeakMap<K, V[]>,
    key: K,
    array: readonly V[],
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
  <K, V extends object>(
    store: Map<K, V>,
    key: K,
    object: Readonly<Partial<V>>,
  ): void;
  <K extends object, V extends object>(
    store: WeakMap<K, V>,
    key: K,
    object: Readonly<Partial<V>>,
  ): void;
} = (store: Map<any, any> | WeakMap<object, any>, key: any, object: any) => {
  if (store.has(key)) {
    Object.assign(store.get(key), object);
  } else {
    store.set(key, object);
  }
};
