export const defaultPropertyOptions = {pure: true};

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
