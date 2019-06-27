/**
 * @module @corpuscule/utils/lib/setters
 *
 * @import
 *
 * ```typescript
 * import {setArray} from '@corpuscule/utils/lib/setters'
 * ```
 */

/**
 * Adds new elements listed in the `array` parameter to the array in the `store`
 * under the `key`. If the array does not exist yet, it will be created.
 *
 * @overload This overload accepts `Map` instance as a store.
 *
 * @param store a `Map` instance which contains or should contain the target
 * array.
 * @param key a key to access the target array.
 * @param array an array with new elements to add to the target array.
 *
 * @example
 *
 * ```typescript
 * const store = new Map<string, string[]>();
 *
 * setArray(store, 'foo', ['bar']);
 * store.get('foo'); // ['bar']
 *
 * setArray(store, 'foo', ['baz']);
 * store.get('foo'); // ['bar', 'baz']
 * ```
 */
export function setArray<K, V>(store: Map<K, V[]>, key: K, array: ReadonlyArray<V>): void;

/**
 * @overload This overload accepts `WeakMap` instance as a store.
 *
 * @param store a `WeakMap` instance.
 * @param key
 * @param array
 *
 * @example
 *
 * ```typescript
 * const store = new WeakMap<object, string[]>();
 * const key = {};
 *
 * setArray(store, key, ['bar']);
 * store.get(key); // ['bar']
 *
 * setArray(store, key, ['baz']);
 * store.get(key); // ['bar', 'baz']
 * ```
 */
export function setArray<K extends object, V>(
  store: WeakMap<K, V[]>,
  key: K,
  array: ReadonlyArray<V>,
): void;

/**
 * Adds new properties listed in the `object` parameter to the object in the
 * `store` under the `key`. If the object does not exist yet, it will be
 * created.
 *
 * @overload This overload accepts `Map` instance as a store.
 *
 * @param store a `Map` instance which contains or should contain the target object.
 * @param key a key to access the target object.
 * @param object an object with new properties to add to the target object.
 *
 * @example
 *
 * ```typescript
 * const store = new Map<string, Record<string, string>>();
 *
 * setArray(store, 'foo', {bar: 1});
 * store.get('foo'); // {bar: 1}
 *
 * setArray(store, 'foo', {baz: 2});
 * store.get('foo'); // {bar: 1, baz: 2}
 * ```
 */
export function setObject<K, V extends object>(
  store: Map<K, V>,
  key: K,
  object: Readonly<Partial<V>>,
): void;

/**
 * @overload This overload accepts `WeakMap` instance as a store.
 *
 * @param store a `WeakMap` instance.
 * @param key
 * @param object
 *
 * @example
 *
 * ```typescript
 * const store = new WeakMap<object, Record<string, string>>();
 * const key = {};
 *
 * setArray(store, key, {bar: 1});
 * store.get(key); // {bar: 1}
 *
 * setArray(store, key, {baz: 2});
 * store.get(key); // {bar: 1, baz: 2}
 * ```
 */
export function setObject<K extends object, V extends object>(
  store: WeakMap<K, V>,
  key: K,
  object: Readonly<Partial<V>>,
): void;
