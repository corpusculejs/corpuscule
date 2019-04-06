import makeAccessor from '@corpuscule/utils/lib/makeAccessor';
import {internalChangedCallback as $internalChangedCallback} from './tokens/lifecycle';

const internal = ({constructor: target}, key, descriptor) => {
  const {get, set} = makeAccessor(descriptor, target.__initializers);

  return {
    configurable: true,
    get,
    set(value) {
      this[$internalChangedCallback](key, get.call(this), value);
      set.call(this, value);
    },
  };
};

export default internal;
