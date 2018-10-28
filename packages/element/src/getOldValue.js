export const oldValueRegistry = new WeakMap();

export const getOldValue = (instance, key) => {
  if (!oldValueRegistry.has(instance)) {
    return undefined;
  }

  return oldValueRegistry.get(instance).get(key);
};
