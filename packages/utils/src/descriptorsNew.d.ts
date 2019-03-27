export const makeAccessor: <T>(
  target: unknown,
  descriptor: PropertyDescriptor,
) => {readonly get: () => T; readonly set: (value: T) => void};
