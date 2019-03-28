export const setArray = (registry, key, value) => {
  if (registry.has(key)) {
    registry.get(key).push(value);
  } else {
    registry.set(key, [value]);
  }
};

export const setObject = (registry, key, object) => {
  if (registry.has(key)) {
    Object.assign(registry.get(key), object);
  } else {
    registry.set(key, object);
  }
};
