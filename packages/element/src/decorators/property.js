import {accessor} from '@corpuscule/utils/lib/descriptors';
import {propertyChangedCallback as $propertyChangedCallback} from '../tokens/lifecycle';
import {assertElementProperty} from '../utils';

const property = (guard = null) => ({
  descriptor: {get, set},
  initializer,
  key,
  kind,
  placement,
}) => {
  assertElementProperty('property', get, set, kind, placement);

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
