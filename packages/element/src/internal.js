import makeAccessor from '@corpuscule/utils/lib/makeAccessor';
import {noop, sharedPropertiesRegistry} from './utils';

export const createInternalChangedCallback = ($connected, $invalidate, callback = noop) =>
  async function internalChangedCallback(...args) {
    if (!this[$connected]) {
      return;
    }

    callback(...args);
    await this[$invalidate]();
  };

const internal = ({constructor: klass}, propertyKey, descriptor) => {
  const {get, set} = makeAccessor(descriptor, klass.__initializers);

  let $internalChangedCallback;
  let $$internalChangedCallback;

  klass.__registrations.push(() => {
    // Here we extract fallback and user-defined property names. If there is no
    // user-defined property, the fallback name will be used.
    ({
      $$internalChangedCallback,
      internalChangedCallback: $internalChangedCallback = $$internalChangedCallback,
    } = sharedPropertiesRegistry.get(klass));
  });

  return {
    configurable: true,
    get,
    set(value) {
      this[$internalChangedCallback](propertyKey, get.call(this), value);
      set.call(this, value);
    },
  };
};

export default internal;
