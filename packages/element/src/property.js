import {accessor} from '@corpuscule/utils/lib/descriptors';
import {propertyChangedCallback as $propertyChangedCallback} from './tokens/lifecycle';
import {assertElementProperty} from './utils';

const property = (guard = null) => descriptor => {
  assertElementProperty('property', descriptor);

  const {
    descriptor: {get, set},
    initializer,
    key,
  } = descriptor;

  return accessor({
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
    get,
    initializer,
    key,
    set,
  });
};

export default property;
