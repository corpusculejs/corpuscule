export const assertKind = (
  decoratorName,
  expectedKind,
  receivedKind,
  {
    correct = expectedKind === receivedKind,
    customMessage = `@${decoratorName} can be applied only to ${expectedKind}, not to ${receivedKind}`,
  } = {},
) => {
  if (!correct) {
    throw new TypeError(customMessage);
  }
};

export const assertPlacement = (
  decoratorName,
  expectedPlacement,
  receivedPlacement,
  {
    correct = expectedPlacement === receivedPlacement,
    customMessage = `@${decoratorName} can be applied only to ${expectedPlacement} class element, ` +
      `not to ${receivedPlacement}`,
  } = {},
) => {
  if (!correct) {
    throw new TypeError(customMessage);
  }
};
