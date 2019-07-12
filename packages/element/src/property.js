import makeAccessor from '@corpuscule/utils/lib/makeAccessor';
import {propertyChangedCallback as $propertyChangedCallback} from './tokens';

const property = (guard = () => true) => ({constructor: klass}, propertyKey, descriptor) => {
  const {get, set} = makeAccessor(descriptor, klass.__initializers);

  return {
    configurable: true,
    get,
    set(value) {
      if (!guard(value)) {
        throw new TypeError(`Value applied to "${propertyKey}" has wrong type`);
      }

      this[$propertyChangedCallback](propertyKey, get.call(this), value);
      set.call(this, value);
    },
  };
};

export default property;
