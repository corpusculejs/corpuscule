/* eslint-disable no-invalid-this, no-empty-function */
const noop = () => {};
const nothing = {};

const getSupers = (elements, names) => {
  const supers = {};

  for (let i = 0; i < names.length; i++) {
    let descriptor;
    // This loop searches user-defined descriptor in elements prioritising own
    // methods as the most up to date. If own element is found, that's the stop
    // signal for the whole loop, otherwise search continues.
    for (let j = 0; j < elements.length; j++) {
      if (elements[j].placement === 'static') {
        continue;
      }

      if (names[i] === elements[j].key) {
        descriptor = elements[j];

        if (elements[j].placement === 'own') {
          break;
        }
      }
    }

    supers[names[i]] = descriptor ? descriptor.descriptor.value : null;
  }

  return [
    supers,
    (target, fallbacks = nothing) => {
      const proto = Object.getPrototypeOf(target.prototype) || nothing;

      for (let i = 0; i < names.length; i++) {
        if (!supers[names[i]]) {
          supers[names[i]] = proto[names[i]] || fallbacks[names[i]] || noop;
        }
      }
    },
  ];
};

export default getSupers;
