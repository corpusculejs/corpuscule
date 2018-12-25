import {internalChangedCallback as $internalChangedCallback} from '../tokens/lifecycle';
import {accessor} from '@corpuscule/utils/lib/descriptors';
import {assertKind, assertPlacement} from '@corpuscule/utils/lib/asserts';

const internal = ({descriptor: {get, set}, initializer, key, kind, placement}) => {
  assertKind('internal', 'field or accessor', kind, {
    correct: kind === 'field' || (kind === 'method' && get && set),
  });

  assertPlacement('internal', 'own or prototype', placement, {
    correct: placement === 'own' || placement === 'prototype',
  });

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
