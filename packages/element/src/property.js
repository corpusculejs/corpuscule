import {propertyChangedCallback as $propertyChangedCallback} from './tokens/lifecycle';
import {makeAccessor} from './utils';

const property = (guard = null) => (prototype, key, descriptor) => {
  const {get: originalGet, set: originalSet} = makeAccessor(prototype, descriptor);

  return {
    configurable: true,
    enumerable: true,
    get: originalGet,
    set(value) {
      if (guard && !guard(value)) {
        throw new TypeError(`Value applied to "${key}" has wrong type`);
      }

      this[$propertyChangedCallback](key, originalGet.call(this), value);
      originalSet.call(this, value);
    },
  };
};

export default property;
