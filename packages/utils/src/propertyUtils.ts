/**
 * @module @corpuscule/utils
 */

/**
 * Extracts string name from a class property. If the property is a symbol, its
 * description will be returned.
 *
 * @param property string or symbol property.
 *
 * @example ```typescript
 *
 * const foo = 'foo';
 * const bar = Symbol('bar');
 *
 * getName(foo); // foo
 * getName(bar); // bar
 * ```
 */
export function getName<P extends PropertyKey>(property: P): P extends number ? number : string {
  return typeof property === 'symbol' ? (property as any).description : property;
}
