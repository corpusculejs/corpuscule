export const assertRequiredProperty: {
  (
    classDecoratorName: string,
    propertyDecoratorName: string,
    propertyName: string,
    propertyValue: unknown,
  ): void;
  (
    classDecoratorName: string,
    propertyDecoratorName: string,
    propertyValue: unknown,
  ): void;
} = (...args: any[]): void => {
  let classDecoratorName;
  let propertyDecoratorName;
  let propertyName = 'any';
  let propertyValue;

  if (args.length === 3) {
    [classDecoratorName, propertyDecoratorName, propertyValue] = args;
  } else {
    [
      classDecoratorName,
      propertyDecoratorName,
      propertyName,
      propertyValue,
    ] = args;
  }

  if (propertyValue === undefined) {
    throw new Error(
      `@${classDecoratorName} requires ${propertyName} property marked with @${propertyDecoratorName}`,
    );
  }
};
