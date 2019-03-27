import {makeAccessor} from '@corpuscule/utils/lib/descriptorsNew';
import {propertyChangedCallback as $propertyChangedCallback} from './tokens/lifecycle';

const property = (guard = null) => ({constructor: target}, key, descriptor) => {
  const {get, set} = makeAccessor(target, descriptor);

  return {
    configurable: true,
    enumerable: true,
    get,
    set(value) {
      if (guard && !guard(value)) {
        throw new TypeError(`Value applied to "${key}" has wrong type`);
      }

      this[$propertyChangedCallback](key, get.call(this), value);
      set.call(this, value);
    },
  };
};

export default property;
