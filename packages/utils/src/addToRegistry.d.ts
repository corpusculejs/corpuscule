declare const addToRegistry: <T extends object, K, V>(registry: WeakMap<T, Map<K, V>>, target: T, key: K, value: V) => void;

export default addToRegistry;
