/* eslint-disable no-empty-function */
const noop = () => {};

const getSupers = (target, names, fallbacks = {}) =>
  names.reduce((supers, name) => {
    supers[name] = target.prototype[name] || fallbacks[name] || noop;

    return supers;
  }, {});

export default getSupers;
