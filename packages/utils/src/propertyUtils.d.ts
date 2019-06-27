/**
 * This module provides tools to work with different kinds of properties:
 * string, symbolic, and private, — identically.
 *
 * @module @corpuscule/utils/lib/propertyUtils
 *
 * @import
 *
 * ```typescript
 * import {getName} from '@corpuscule/utils/lib/propertyUtils'
 * ```
 */

/**
 * Extracts string name from a class property. If the property is a symbol, its
 * description will be returned.
 *
 * @param property string or symbol property.
 *
 * @example
 * ```typescript
 * const foo = 'foo';
 * const bar = Symbol('bar');
 *
 * getName(foo); // foo
 * getName(bar); // bar
 * ```
 */
export function getName<P extends PropertyKey>(property: P): P extends number ? number : string;
