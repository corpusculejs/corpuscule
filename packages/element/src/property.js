import makeAccessor from '@corpuscule/utils/lib/makeAccessor';
import {sharedPropertiesRegistry} from './utils';

const property = (guard = () => true) => ({constructor: klass}, propertyKey, descriptor) => {
  const {get, set} = makeAccessor(descriptor, klass.__initializers);

  let $propertyChangedCallback;
  let $$propertyChangedCallback;

  klass.__registrations.push(() => {
    // Here we extract fallback and user-defined property names. If there is no
    // user-defined property, the fallback name will be used.
    ({
      $$propertyChangedCallback,
      propertyChangedCallback: $propertyChangedCallback = $$propertyChangedCallback,
    } = sharedPropertiesRegistry.get(klass));
  });

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
