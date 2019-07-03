const attribute = (attributeName, guard) => (prototype, propertyKey) => {
  if (guard !== Boolean && guard !== Number && guard !== String) {
    throw new TypeError('Guard for @attribute should be either Number, Boolean or String');
  }

  const {constructor: klass} = prototype;
  const guardType = typeof guard(null);

  klass.__registrations.push(() => {
    klass.observedAttributes.push(attributeName);
  });

  return {
    configurable: true,
    get() {
      const value = this.getAttribute(attributeName);

      if (guard === Boolean) {
        return value !== null;
      }

      return value !== null ? (guard === String ? value : guard(value)) : null;
    },
    set(value) {
      if (value != null && typeof value !== guardType) {
        throw new TypeError(`Value applied to "${propertyKey}" is not ${guard.name} or undefined`);
      }

      if (value == null || value === false) {
        this.removeAttribute(attributeName);
      } else {
        this.setAttribute(attributeName, value === true ? '' : value);
      }
    },
  };
};

export default attribute;
