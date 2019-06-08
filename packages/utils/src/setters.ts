/**
 * Adds new elements listed in the `array` parameter to the array in the `store`
 * under the `key`. If the array does not exist yet, it will be created.
 *
 * @example ```typescript
 * const store = new Map<string, string[]>();
 *
 * setArray(store, 'foo', ['bar']);
 *
 * store.get('foo'); // ['bar']
 *
 * setArray(store, 'foo', ['baz']);
 *
 * store.get('foo'); // ['bar', 'baz']
 * ```
 *
 * @param store a Map or a WeakMap which contains or should contain the target array.
 *
 * @param key a key to access the target array.
 *
 * @param array an array with new elements to add to the target array.
 */
export const setArray: {
  <K, V>(store: Map<K, V[]>, key: K, array: readonly V[]): void;
  <K extends object, V>(store: WeakMap<K, V[]>, key: K, array: readonly V[]): void;
} = (store, key, array) => {
  if (store.has(key)) {
    store.get(key).push(...array);
  } else {
    store.set(key, array);
  }
};

/**
 * Adds new properties listed in the `object` parameter to the object in the
 * `store` under the `key`. If the object does not exist yet, it will be
 * created.
 *
 * @example ```typescript
 * const store = new Map<string, Record<string, string>>();
 *
 * setArray(store, 'foo', {bar: 1});
 *
 * store.get('foo'); // {bar: 1}
 *
 * setArray(store, 'foo', {baz: 2});
 *
 * store.get('foo'); // {bar: 1, baz: 2}
 * ```
 *
 * @param store a Map or a WeakMap which contains or should contain the target object.
 *
 * @param key a key to access the target object.
 *
 * @param object an object with new properties to add to the target object.
 */
export const setObject: {
  <K, V extends object>(store: Map<K, V>, key: K, object: Partial<V>): void;
  <K extends object, V extends object>(store: WeakMap<K, V>, key: K, value: Partial<V>): void;
} = (store, key, object) => {
  if (store.has(key)) {
    Object.assign(store.get(key), object);
  } else {
    store.set(key, object);
  }
};
