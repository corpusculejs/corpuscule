import makeAccessor from '@corpuscule/utils/lib/makeAccessor';
import {internalChangedCallback as $internalChangedCallback} from './tokens';

const internal = ({constructor: klass}, propertyKey, descriptor) => {
  const {get, set} = makeAccessor(descriptor, klass.__initializers);

  return {
    configurable: true,
    get,
    set(value) {
      const oldValue = get.call(this);
      set.call(this, value);
      this[$internalChangedCallback](propertyKey, oldValue, value);
    },
  };
};

export default internal;
