// tslint:disable:readonly-array

export const setArray: {
  <K, V>(registry: Map<K, V[]>, key: K, value: V): void;
  <K extends object, V>(registry: WeakMap<K, V[]>, key: K, value: V): void;
};
