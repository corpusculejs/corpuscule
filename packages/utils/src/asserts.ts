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
 * @module asserts
 *
 * @import ```typescript
 *
 * import {assertRequiredProperty} from '@corpuscule/utils/lib/asserts'
 * ```
 */

/**
 * Checks the property to have a value and throws a formatted error if the
 * property does not have it.
 *
 * @overload
 * This overload should be used if the property with the specific name required
 * to be marked with the marker. The function throws an error like `@foo requires
 * bar property marked with @baz`.
 *
 * @param decoratorName a name of the decorator the assertion applies to.
 *
 * @param markerName a name of the decorator the property should be marked with.
 *
 * @param propertyName a name of the property the assertion is applied to.
 * Omitting this parameter means that any property should be marked with the
 * marker decorator.
 *
 * @param property a value of the property.
 */
export function assertRequiredProperty(
  decoratorName: string,
  markerName: string,
  propertyName: string,
  property: unknown,
): void;

/**
 * @overload
 * This overload should be used if any property of the class required to be
 * marked with the marker. The function will throw an error like `@foo requires
 * property marked with @baz`.
 *
 * @param decoratorName
 *
 * @param markerName
 *
 * @param property
 */
export function assertRequiredProperty(
  decoratorName: string,
  markerName: string,
  property: unknown,
): void;

export function assertRequiredProperty(...args: any[]): void {
  let decoratorName;
  let markerName;
  let propertyName = 'any';
  let property;

  if (args.length === 3) {
    [decoratorName, markerName, property] = args;
  } else {
    [decoratorName, markerName, propertyName, property] = args;
  }

  if (property === undefined) {
    throw new Error(
      `@${decoratorName} requires ${propertyName} property marked with @${markerName}`,
    );
  }
}
