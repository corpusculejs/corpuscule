import {unsafeStatic, withUnsafeStatic} from './withUnsafeStatic';

const cache = new WeakMap();

const withCorpusculeElement = (processor) => {
  const processorWithUnsafeStatic = withUnsafeStatic(processor);

  return (strings, ...values) => {
    for (let i = 0; i < values.length; i++) {
      if (typeof values[i] === 'function' && values[i].isCorpusculeElement) {
        let value = cache.get(values[i]);

        if (!value) {
          value = unsafeStatic(values[i].is);
          cache.set(values[i], value);
        }

        values[i] = value;
      }
    }

    return processorWithUnsafeStatic(strings, ...values);
  };
};

export default withCorpusculeElement;
