/* eslint-disable no-empty-function */
/* istanbul ignore next */
const noop = () => {};

const reflectClassMethods = (klass, methodNames, fallbacks = {}) =>
  methodNames.reduce((reflection, name) => {
    reflection[name] = klass[name] || fallbacks[name] || noop;

    return reflection;
  }, {});

export default reflectClassMethods;
