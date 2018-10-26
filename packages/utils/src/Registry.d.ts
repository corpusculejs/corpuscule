export default class Registry<T extends object, K, V> {
  public get(target: T, key: K): V | undefined;

  public set(target: T, key: K, value: V): void;
}
