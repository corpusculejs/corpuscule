/* eslint-disable no-empty-function */
/* istanbul ignore next */
const noop = () => {};

const getSupers = (target, names, fallbacks = {}) =>
  names.reduce((supers, name) => {
    supers[name] = target[name] || fallbacks[name] || noop;

    return supers;
  }, {});

export default getSupers;
