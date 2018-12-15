import {unsafeStatic, UnsafeStatic, withUnsafeStatic} from './withUnsafeStatic';

export {unsafeStatic, UnsafeStatic};

const customElementNameRegistry = new WeakMap();
const cache = new WeakMap();

const define = customElements.define;

// Monkey-patch the customElements registry to allow using "withCustomElement"
// with any CustomElement used in the project
customElements.define = function(name, constructor, options) {
  define.call(this, name, constructor, options);
  customElementNameRegistry.set(constructor, name);
};

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
