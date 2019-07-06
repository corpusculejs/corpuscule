/**
 * @module @corpuscule/utils/lib/shallowEqual
 *
 * ```typescript
 * import shallowEqual from '@corpuscule/utils/lib/shallowEqual'
 * ```
 */

/**
 * Compares two objects following the idea that one object is shallowly equal
 * to another if each property of this object is equal to each property of
 * another.
 *
 * @param objA the first object to compare
 * @param objB the second object to compare
 *
 * @returns result of the comparison
 *
 * ### Example
 * ```typescript
 * const objA = {foo: 1, bar: 2};
 * const objB = {foo: 1, bar: 2};
 * const objC = {foo: 1, baz: 2};
 *
 * shallowEqual(objA, objB); // true
 * shallowEqual(objA, objC); // false
 * ```
 */
export default function shallowEqual<T extends any, U extends any>(objA: T, objB: U): boolean;
