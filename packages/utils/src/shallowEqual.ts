/**
 * @module @corpuscule/utils
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
 * @example ```typescript
 *
 * const objA = {foo: 1, bar: 2};
 * const objB = {foo: 1, bar: 2};
 * const objC = {foo: 1, baz: 2};
 *
 * shallowEqual(objA, objB); // true
 * shallowEqual(objA, objC); // false
 * ```
 */
export default function shallowEqual<T extends any, U extends any>(objA: T, objB: U): boolean {
  if (Object.is(objA, objB)) {
    return true;
  }

  if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
    return false;
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  // tslint:disable-next-line:increment-decrement
  for (let i = 0; i < keysA.length; i++) {
    if (
      !Object.prototype.hasOwnProperty.call(objB, keysA[i]) ||
      !Object.is(objA[keysA[i]], objB[keysA[i]])
    ) {
      return false;
    }
  }

  return true;
}
