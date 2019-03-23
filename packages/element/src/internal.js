import {internalChangedCallback as $internalChangedCallback} from './tokens/lifecycle';
import {makeAccessor} from './utils';

const internal = (prototype, key, descriptor) => {
  const {get: originalGet, set: originalSet} = makeAccessor(prototype, descriptor);

  return {
    configurable: true,
    enumerable: true,
    get: originalGet,
    set(value) {
      this[$internalChangedCallback](key, originalGet.call(this), value);
      originalSet.call(this, value);
    },
  };
};

export default internal;
