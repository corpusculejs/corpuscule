/**
 * @module getSupers
 *
 * @import
 * ```typescript
 * import getSupers from '@corpuscule/utils/lib/getSupers'
 * ```
 */

/**
 * Extracts all methods mentioned in `names` from the `target`, puts them
 * together into the separate object and returns it. If the method does not
 * exist in the `target`, the function from the `fallbacks` under the same name
 * will be used. If there is no appropriate element in the `target` or the
 * `fallbacks`, the method will be a noop function.
 *
 * @param target a class declaration prototype.
 *
 * @param names a list of names of methods to extract.
 *
 * @param fallbacks a list of fallback functions to replace methods which are
 * missing in the `target`.
 *
 * @returns an object that has a method for all keys mentioned in the `names`
 * array. Method could be a target method (both own or inherited), a fallback
 * function or a noop.
 *
 * @example
 * ```typescript
 * class Foo {
 *   public foo() {
 *     console.log('foo called');
 *   }
 * }
 *
 * class Bar extends Foo {
 *   public bar() {
 *     console.log('bar called');
 *   }
 * }
 *
 * const fallbacks = {
 *   baz() {
 *     console.log('baz called');
 *   }
 * };
 *
 * const bar = new Bar();
 *
 * const supers = getSupers(bar, ['foo', 'bar', 'baz', 'boo'], fallbacks);
 *
 * supers.foo(); // foo called
 * supers.bar(); // bar called
 * supers.baz(); // baz called
 * supers.boo(); // <nothing happens>
 * ```
 */
export default function getSupers<N extends PropertyKey>(
  target: any,
  names: ReadonlyArray<N>,
  fallbacks?: Partial<Record<N, Function>>,
): Record<N, Function>;
