const assertKind = (
  decoratorName,
  expectedKind,
  receivedKind,
  correct = expectedKind === receivedKind,
) => {
  if (!correct) {
    throw new TypeError(`@${decoratorName} can be applied only to ${expectedKind}, not to ${receivedKind}`);
  }
};

export default assertKind;
