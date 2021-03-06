/**
 * This module provides tools to transform property descriptors to accessor
 * descriptors.
 *
 * ### Usage
 * ```typescript
 * import makeAccessor from '@corpuscule/utils/lib/makeAccessor'
 * ```
 *
 * @module @corpuscule/utils/lib/makeAccessor
 */

/**
 * Converts the regular property to an accessor and registers the initializer
 * to set the initial value. If the received descriptor already belongs to an
 * accessor, it will be returned as is.
 *
 * @param descriptor a property or an accessor descriptor.
 *
 * @param initializers an array of functions to register the initial value
 * initializer.
 */
export default function makeAccessor(
  descriptor: PropertyDescriptor & {initializer?: () => unknown},
  initializers: Array<(self: object) => void>,
): Required<Pick<PropertyDescriptor, 'get' | 'set'>> & Omit<PropertyDescriptor, 'get' | 'set'>;
