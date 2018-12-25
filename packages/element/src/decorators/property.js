import {assertKind, assertPlacement} from '@corpuscule/utils/lib/asserts';
import {accessor} from '@corpuscule/utils/lib/descriptors';
import {propertyChangedCallback as $propertyChangedCallback} from '../tokens/lifecycle';

const property = (guard = null) => ({
  descriptor: {get, set},
  initializer,
  key,
  kind,
  placement,
}) => {
  assertKind('property', 'field or accessor', kind, {
    correct: kind === 'field' || (kind === 'method' && get && set),
  });

  assertPlacement('property', 'own or prototype', placement, {
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
          if (guard && !guard(value)) {
            throw new TypeError(`Value applied to "${key}" has wrong type`);
          }

          this[$propertyChangedCallback](key, originalGet.call(this), value);
          originalSet.call(this, value);
        },
      }),
    },
  );
};

export default property;
