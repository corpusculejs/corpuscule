/* eslint-disable no-invalid-this, no-empty-function */
import {field} from './descriptors';

const noop = () => {};

const createSupers = (elements, options) =>
  Object.entries(options).map(([name, keyOrOptions]) => {
    let fallback;
    let key;

    if (typeof keyOrOptions === 'object') {
      ({fallback, key} = keyOrOptions);
    } else {
      key = keyOrOptions;
    }

    const method =
      elements.find(({key: k, kind}) => k === name && kind === 'field') ||
      elements.find(({key: k}) => k === name);

    return field({
      initializer() {
        if (method) {
          return method.kind === 'method'
            ? method.descriptor.value.bind(this)
            : method.initializer.call(this);
        }

        const prototype = Object.getPrototypeOf(this.constructor.prototype);

        if (prototype && typeof prototype[name] === 'function') {
          return prototype[name].bind(prototype);
        }

        if (fallback) {
          return fallback.bind(this);
        }

        return noop;
      },
      key,
    });
  });

export default createSupers;
