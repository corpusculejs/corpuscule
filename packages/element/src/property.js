import makeAccessor from '@corpuscule/utils/lib/makeAccessor';
import {propertyChangedCallback as $propertyChangedCallback} from './tokens/lifecycle';

const property = (guard = null) => ({constructor: target}, key, descriptor) => {
  const {get, set} = makeAccessor(descriptor, target.__initializers);

  return {
    configurable: true,
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
