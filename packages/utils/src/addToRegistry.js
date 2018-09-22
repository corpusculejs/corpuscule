const addToRegistry = (registry, target, key, value) => {
  if (registry.has(target)) {
    registry.get(target).set(key, value);
  } else {
    registry.set(target, new Map([[key, value]]));
  }
};

export default addToRegistry;
