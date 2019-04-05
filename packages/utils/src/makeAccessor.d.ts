declare const makeAccessor: <T>(
  descriptor: PropertyDescriptor,
  initializers: Array<(self: unknown) => void>, // tslint:disable-line:readonly-array
) => {
  readonly configurable?: boolean;
  readonly enumerable?: boolean;
  readonly get: () => T;
  readonly set: (value: T) => void;
};

export default makeAccessor;
