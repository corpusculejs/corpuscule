import customElementNameRegistry from './init';
import {unsafeStatic, UnsafeStatic, withUnsafeStatic} from './withUnsafeStatic';

export {unsafeStatic, UnsafeStatic};

const cache = new WeakMap();

const withCustomElement = processor => {
  const processorWithUnsafeStatic = withUnsafeStatic(processor);

  return (strings, ...values) => {
    for (let i = 0; i < values.length; i++) {
      if (customElementNameRegistry.has(values[i])) {
        let cachedValue = cache.get(values[i]);

        if (!cachedValue) {
          cachedValue = unsafeStatic(customElementNameRegistry.get(values[i]));
          cache.set(values[i], cachedValue);
        }

        values[i] = cachedValue;
      }
    }

    return processorWithUnsafeStatic(strings, ...values);
  };
};

export default withCustomElement;
