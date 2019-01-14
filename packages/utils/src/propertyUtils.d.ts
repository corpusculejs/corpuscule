export const isPublic: (property: PropertyKey | WeakMap<object, unknown>) => boolean;

export const getValue: {
  <T, P extends keyof T>(self: T, property: P): T[P];
  (self: unknown, property: WeakMap<object, unknown>): unknown;
};

export const setValue: {
  <T, P extends keyof T>(self: T, property: P, value: T[P]): void;
  (self: unknown, property: WeakMap<object, unknown>, value: unknown): void;
};

// tslint:disable:readonly-array
export const call: {
  <T extends Record<P, (...a: any[]) => any>, P extends keyof T>(
    self: T,
    property: P,
    ...args: Parameters<T[P]>
  ): ReturnType<T[P]>;
  <A extends any[]>(
    self: unknown,
    property: WeakMap<object, (...args: A) => void>,
    ...args: A
  ): unknown;
};
// tslint:enable:readonly-array

export const getName: <P extends PropertyKey | {readonly description: string}>(
  property: P,
) => P extends number ? number : string;
