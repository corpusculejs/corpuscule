/* eslint-disable no-invalid-this */

const getSuperMethods = (elements, names, defaults = {}) =>
  names.map(name => {
    const method = elements.find(({key}) => key === name);

    return method
      ? method.descriptor.value
      : function superMethod(...args) {
          if (this) {
            const superClass = Object.getPrototypeOf(this.constructor.prototype);

            if (superClass && typeof superClass[name] === 'function') {
              return superClass[name](...args);
            }
          }

          if (typeof defaults[name] === 'function') {
            return defaults[name].apply(this, args);
          }

          return undefined;
        };
  });

export default getSuperMethods;
