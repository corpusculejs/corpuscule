/* istanbul ignore next */
// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = (): void => {};

const reflectMethods = <
  PropertyName extends PropertyKey,
  ObjectToReflect extends Partial<Record<PropertyName, Function>>
>(
  objectToReflect: ObjectToReflect,
  methodNames: readonly PropertyName[],
  fallbacks: Partial<Record<PropertyName, Function>> = {},
): Record<PropertyName, Function> =>
  methodNames.reduce<Record<PropertyName, Function>>((reflection, name) => {
    reflection[name] = objectToReflect[name] ?? fallbacks[name] ?? noop;

    return reflection;
  }, {} as Record<PropertyName, Function>);

export default reflectMethods;
