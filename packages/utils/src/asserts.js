export const assertRequiredProperty = (...args) => {
  let classDecoratorName;
  let propertyDecoratorName;
  let propertyName = 'any';
  let propertyValue;

  if (args.length === 3) {
    [classDecoratorName, propertyDecoratorName, propertyValue] = args;
  } else {
    [classDecoratorName, propertyDecoratorName, propertyName, propertyValue] = args;
  }

  if (propertyValue === undefined) {
    throw new Error(
      `@${classDecoratorName} requires ${propertyName} property marked with @${propertyDecoratorName}`,
    );
  }
};
