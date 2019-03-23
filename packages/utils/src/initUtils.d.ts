export const createInitializer: () => [
  (target: unknown, callback: (this: unknown) => void) => void,
  (self: unknown) => void
];

export const createRegistrator: () => [
  (target: unknown, callback: () => void) => void,
  (target: unknown) => void
];
