import {corpusculeElements} from './decorators/element';
import {withUnsafeStatic} from './withUnsafeStatic';

const withCorpusculeElement = (processor) => {
  const processorWithUnsafeStatic = withUnsafeStatic(processor);

  return (strings, ...values) => {
    for (let i = 0; i < values.length; i++) {
      if (typeof values[i] === 'object' && corpusculeElements.has(values[i])) {
        values[i] = corpusculeElements.get(values[i]);
      }
    }

    return processorWithUnsafeStatic(strings, values);
  };
};

export default withCorpusculeElement;
