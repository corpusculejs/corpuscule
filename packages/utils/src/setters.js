export const setArray = (registry, key, value) => {
  if (registry.has(key)) {
    registry.get(key).push(value);
  } else {
    registry.set(key, [value]);
  }
};
