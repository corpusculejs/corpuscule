export const createBaseCallbackCaller = (name, elements) => {
  const callback = elements.find(({key}) => key === name);

  return (instance) => {
    if (callback) {
      callback.descriptor.value.call(instance);
    } else {
      const superClass = Object.getPrototypeOf(instance.constructor.prototype);

      if (superClass[name]) {
        superClass[name].call(instance);
      }
    }
  };
};
