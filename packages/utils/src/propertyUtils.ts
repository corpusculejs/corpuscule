/**
 * Extracts string name from a class property. If the property is a symbol, its
 * description will be returned.
 *
 * @example ```typescript
 * const foo = 'foo';
 * const bar = Symbol('bar');
 *
 * getName(foo); // foo
 * getName(bar); // bar
 * ```
 *
 * @param property string or symbol property.
 */
export const getName = <P extends PropertyKey>(property: P): P extends number ? number : string =>
  typeof property === 'symbol' ? (property as any).description : property;
