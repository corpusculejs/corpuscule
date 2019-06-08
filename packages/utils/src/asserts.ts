/**
 * Checks the property to have a value and throws a formatted error if the
 * property does not have it.
 *
 * @param decoratorName a name of the decorator the assertion applies to.
 *
 * @param markerName a name of the decorator the property should be marked with.
 *
 * @param [propertyName] a name of the property the assertion is applied to.
 * Omitting this parameter means that any property should be marked with the
 * marker decorator.
 *
 * @param property a value of the property.
 */
export const assertRequiredProperty: {
  (decoratorName: string, markerName: string, propertyName: string, property: unknown): void;
  (decoratorName: string, markerName: string, property: unknown): void;
} = (...args) => {
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
};
