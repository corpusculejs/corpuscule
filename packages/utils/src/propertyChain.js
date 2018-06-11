export const getPropertyChainDescriptors = (object, propertyKey) => {
  const descriptors = [];
  let o = object;

  while (o !== null) {
    if (Object.prototype.hasOwnProperty.call(o, propertyKey)) {
      descriptors.push(Object.getOwnPropertyDescriptor(o, propertyKey));
    }

    o = Object.getPrototypeOf(o);
  }

  return descriptors;
};

const getData = (descriptor, instance) => ( // eslint-disable-line no-extra-parens
  descriptor.get
    ? descriptor.get.call(instance)
    : descriptor.value
);

export const getDescriptorChainValues = ([sample, ...descriptors], {
  instance,
  merge = false,
} = {}) => {
  let data = getData(sample, instance);
  const isArray = Array.isArray(data);
  const isObject = typeof data === "object" && !isArray;

  const result = merge && isObject
    ? data
    : (isArray ? data : [data]); // eslint-disable-line no-extra-parens

  for (const descriptor of descriptors) {
    data = getData(descriptor, instance);

    if (merge && isObject) {
      Object.assign(result, data);
      continue;
    }

    result.push(...merge && isArray ? data : [data]);
  }

  return result;
};
