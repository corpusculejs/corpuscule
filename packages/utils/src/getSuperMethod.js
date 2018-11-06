/* eslint-disable no-invalid-this */

const getSuperMethod = (name, elements) => {
  const method = elements.find(({key}) => key === name);

  return function superMethod(...args) {
    if (method) {
      method.descriptor.value.apply(this, args);
    } else {
      const superClass = Object.getPrototypeOf(this.constructor.prototype);

      if (superClass[name]) {
        superClass[name].apply(this, args);
      }
    }
  };
};

export default getSuperMethod;
