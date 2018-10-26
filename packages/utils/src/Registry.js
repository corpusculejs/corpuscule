export default class Registry {
  constructor() {
    this.store = new WeakMap();
  }

  get(target, key) {
    if (!this.store.has(target)) {
      return undefined;
    }

    return this.store.get(target).get(key);
  }

  set(target, key, value) {
    if (this.store.has(target)) {
      this.store.get(target).set(key, value);
    } else {
      this.store.set(target, new Map([[key, value]]));
    }
  }
}
