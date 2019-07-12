/**
 * This module provides tools to work with restrictions of the Custom Elements
 * spec.
 *
 * ### Usage
 * ```typescript
 * import defineExtendable from '@corpuscule/utils/lib/defineExtendable'
 * ```
 *
 * @module @corpuscule/utils/lib/defineExtendable
 */

/**
 * A workaround for a Corpuscule-decorated class inheritance. Corpuscule
 * decorators applied to a class override user-defined Custom Elements
 * lifecycle hooks like `connectedCallback` etc. creating an internal worker
 * method which is necessary for Corpuscule elements to work correctly.
 * However, if the user wants to extend the class, the wrapper is unnecessary
 * and could cause undefined behavior and harm the runtime execution.
 *
 * This function is a solution to this problem. It replaces a lifecycle hook
 * with a wrapper that calls two different methods depending on whether the
 * class is extended or not. If the class is not extended, the Corpuscule
 * worker is called; otherwise, the original user-defined method is used.
 *
 * @param klass a class declaration which lifecycle hooks should be redefined
 * to be extendable.
 *
 * @param baseClassMethods an object with methods that should be used in case
 * the class is not extended.
 *
 * @param extendedClassMethods an object with methods that should be used in
 * case the class is extended.
 *
 * @param initializers an array of functions to register the function to
 * execute during the class instantiation.
 */
export default function defineExtendable<N extends PropertyKey>(
  klass: any,
  baseClassMethods: Record<N, Function>,
  extendedClassMethods: Record<N, Function>,
  initializers: Array<(self: object) => void>,
): void;
