// tslint:disable:readonly-array

declare const addToRegistry: {
  <T extends object, K, V>(registry: WeakMap<T, Map<K, V>>, target: T, key: K, value: V): void;
  <T extends object, V>(registry: WeakMap<T, V[]>, target: T, value: V): void;
};

export default addToRegistry;
