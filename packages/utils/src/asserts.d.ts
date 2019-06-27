/**
 * This module contains assertion functions that can be used to verify the
 * correctness of the decorator application.
 *
 * For example, you want to make sure that the user applies class decorators to
 * classes and property decorators to properties. Or you have two decorators:
 * `@classDecorator` and `@propertyDecorator` and at least one property of the
 * class marked with the `@classDecorator` should be marked with the
 * `@propertyDecorator`.
 *
 * This module contains assertions to check these cases.
 *
 * @module @corpuscule/utils/lib/asserts
 *
 * @import
 * ```typescript
 * import {assertRequiredProperty} from '@corpuscule/utils/lib/asserts'
 * ```
 */

/**
 * Checks if the property decorator actually applied to a property of a class
 * marked with class decorator by checking the value of this property and
 * creates a formatted error if it does not.
 *
 * @overload
 * This overload should be used if the property of the class required to be
 * marked with the property decorator has a specific name. The function will
 * throw an error like:
 * ```
 * Error: @foo requires bar property marked with @baz
 * ```
 *
 * @param classDecoratorName a name of the base class decorator that requires
 * some property marked with some property decorator.
 *
 * @param propertyDecoratorName a name of the decorator the class decorator
 * requires to mark the property with.
 *
 * @param propertyName a name of the property the assertion is applied to.
 *
 * @param propertyValue a value of the property.
 */
export function assertRequiredProperty(
  classDecoratorName: string,
  propertyDecoratorName: string,
  propertyName: string,
  propertyValue: unknown,
): void;

/**
 * @overload
 * This overload should be used if any property of the class required to be
 * marked with the property decorator. The function will throw an error like
 * ```
 * Error: @foo requires property marked with @baz
 * ```.
 */
export function assertRequiredProperty(
  classDecoratorName: string,
  propertyDecoratorName: string,
  propertyValue: unknown,
): void;
