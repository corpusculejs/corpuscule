export const createAccessorMaker: (
  initializer: (target: unknown, callback: (this: unknown) => void) => void,
) => <T>(
  target: unknown,
  descriptor: PropertyDescriptor,
) => {readonly get: () => T; readonly set: (value: T) => void};
