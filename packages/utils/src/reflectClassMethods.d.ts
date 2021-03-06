/**
 * This module provides tools to extract existing methods of the class to the
 * object to use later.
 *
 * ### Usage
 * ```typescript
 * import reflectClassMethods from '@corpuscule/utils/lib/reflectClassMethods'
 * ```
 *
 * @module @corpuscule/utils/lib/reflectClassMethods
 */

/**
 * Extracts all methods mentioned in `names` from the `target`, puts them
 * together into the separate object and returns it. If the method does not
 * exist in the `target`, the function from the `fallbacks` under the same name
 * will be used. If there is no appropriate element in the `target` or the
 * `fallbacks`, the method will be a noop function.
 *
 * @param klass a class declaration prototype.
 *
 * @param methodNames a list of names of methods to extract.
 *
 * @param fallbacks a list of fallback functions to replace methods which are
 * missing in the `target`.
 *
 * @returns an object that has a method for all keys mentioned in the `names`
 * array. Method could be a target method (both own or inherited), a fallback
 * function or a noop.
 *
 * ### Example
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
 * const reflection = reflectClassMethods(bar, ['foo', 'bar', 'baz', 'boo'], fallbacks);
 *
 * reflection.foo(); // foo called
 * reflection.bar(); // bar called
 * reflection.baz(); // baz called
 * reflection.boo(); // <nothing happens>
 * ```
 */
export default function reflectClassMethods<N extends PropertyKey>(
  klass: any,
  methodNames: ReadonlyArray<N>,
  fallbacks?: Partial<Record<N, Function>>,
): Record<N, Function>;
