/* eslint-disable no-param-reassign */

const addToRegistry = (registry, target, key, value) => {
  if (value === undefined) {
    value = key;
    key = undefined;
  }

  if (registry.has(target)) {
    const record = registry.get(target);

    if (key) {
      record.set(key, value);
    } else {
      record.push(value);
    }
  } else if (key) {
    registry.set(target, new Map([[key, value]]));
  } else {
    registry.set(target, [value]);
  }
};

export default addToRegistry;
