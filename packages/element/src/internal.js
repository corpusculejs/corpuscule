import makeAccessor from '@corpuscule/utils/lib/makeAccessor';
import {internalChangedCallback as $internalChangedCallback} from './tokens';

const internal = ({constructor: klass}, propertyKey, descriptor) => {
  const {get, set} = makeAccessor(descriptor, klass.__initializers);

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
