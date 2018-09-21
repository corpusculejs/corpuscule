export const defaultPropertyOptions = {pure: true};

export const assertField = (decorator, key, kind) => {
  if (kind !== "field") {
    throw new TypeError(`@${decorator} can be applied only to class field and "${key}" is not a field`);
  }
};

export const addToRegistry = (registry, target, key, value) => {
  if (registry.has(target)) {
    registry.get(target).set(key, value);
  } else {
    registry.set(target, new Map([[key, value]]));
  }
};

export const handleError = (e) => {
  throw e;
};

export const parseAttributeValue = (value, guard) => {
  switch (guard) {
    case Boolean:
      return value !== null;
    case Number:
      return Number(value);
    default:
      return String(value);
  }
};

export const prepareComputed = (instance, propertyName, registry, watchings, get) => {
  let map = registry.get(instance);

  if (!map) {
    map = new Map();
    registry.set(instance, map);
  }

  let computedData = map.get(propertyName);

  if (!computedData) {
    const value = get.call(instance);
    const cache = watchings.reduce((acc, watchingProperty) => {
      acc.set(watchingProperty, instance[watchingProperty]);

      return acc;
    }, new Map());

    computedData = {
      cache,
      value,
    };

    map.set(propertyName, computedData);
  }

  return computedData;
};

export const toAttribute = (instance, attributeName, value) => {
  if (typeof value === "boolean") {
    if (value) {
      instance.setAttribute(attributeName, "");
    } else {
      instance.removeAttribute(attributeName);
    }
  } else {
    instance.setAttribute(attributeName, value.toString());
  }
};
