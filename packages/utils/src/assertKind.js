const assertKind = (
  decoratorName,
  expectedKind,
  receivedKind,
  shouldThrow = expectedKind !== receivedKind,
) => {
  if (shouldThrow) {
    throw new TypeError(`@${decoratorName} can be applied only to ${expectedKind}, not to ${receivedKind}`);
  }
};

export default assertKind;
