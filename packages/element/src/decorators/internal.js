import {internalChangedCallback as $internalChangedCallback} from '../tokens/lifecycle';
import {accessor} from '@corpuscule/utils/lib/descriptors';
import {assertElementProperty} from '../utils';

const internal = ({descriptor: {get, set}, initializer, key, kind, placement}) => {
  assertElementProperty('internal', get, set, kind, placement);

  return accessor(
    {
      get,
      initializer,
      key,
      set,
    },
    {
      adjust: ({get: originalGet, set: originalSet}) => ({
        get: originalGet,
        set(value) {
          this[$internalChangedCallback](key, originalGet.call(this), value);
          originalSet.call(this, value);
        },
      }),
    },
  );
};

export default internal;
