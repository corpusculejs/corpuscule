const getSuperMethod = (name, elements) => {
  const method = elements.find(({key}) => key === name);

  return (instance) => {
    if (method) {
      method.descriptor.value.call(instance);
    } else {
      const superClass = Object.getPrototypeOf(instance.constructor.prototype);

      if (superClass[name]) {
        superClass[name].call(instance);
      }
    }
  };
};

export default getSuperMethod;
