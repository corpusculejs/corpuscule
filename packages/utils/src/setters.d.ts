export const setArray: {
  <K, V>(registry: Map<K, V[]>, key: K, value: V): void;
  <K extends object, V>(registry: WeakMap<K, V[]>, key: K, value: V): void;
};

export const setObject: {
  <K, V extends object>(registry: Map<K, V>, key: K, object: Partial<V>): void;
  <K extends object, V extends object>(registry: WeakMap<K, V>, key: K, value: Partial<V>): void;
};
