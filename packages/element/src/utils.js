
export const assertElementDecoratorsKindAndPlacement = (decoratorName, kind, placement) => {
  if (kind !== "field") {
    throw new TypeError(
      `@${decoratorName} can be applied only to field, not to ${kind}. `
      + `Also @${decoratorName} expected to be the first executed decorator, so pay attention `
      + "to an order of your decorators",
    );
  }

  if (placement !== "own") {
    throw new TypeError(
      `@${decoratorName} can only be applied to an instance field, `
      + `it is unusable with ${placement}`
    );
  }
};
