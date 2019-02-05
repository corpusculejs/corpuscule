import {accessor} from '@corpuscule/utils/lib/descriptors';
import {internalChangedCallback as $internalChangedCallback} from './tokens/lifecycle';
import {assertElementProperty} from './utils';

const internal = descriptor => {
  assertElementProperty('internal', descriptor);

  const {
    descriptor: {get, set},
    initializer,
    key,
  } = descriptor;

  return accessor({
    adjust: ({get: originalGet, set: originalSet}) => ({
      get: originalGet,
      set(value) {
        this[$internalChangedCallback](key, originalGet.call(this), value);
        originalSet.call(this, value);
      },
    }),
    get,
    initializer,
    key,
    set,
  });
};

export default internal;
