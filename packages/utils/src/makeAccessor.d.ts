declare const makeAccessor: <T>(
  target: unknown,
  descriptor: PropertyDescriptor,
) => {
  readonly configurable?: boolean;
  readonly enumerable?: boolean;
  readonly get: () => T;
  readonly set: (value: T) => void;
};

export default makeAccessor;
