import {makeAccessor} from '@corpuscule/utils/lib/descriptorsNew';
import {internalChangedCallback as $internalChangedCallback} from './tokens/lifecycle';

const internal = ({constructor: target}, key, descriptor) => {
  const {get, set} = makeAccessor(target, descriptor);

  return {
    configurable: true,
    enumerable: true,
    get,
    set(value) {
      this[$internalChangedCallback](key, get.call(this), value);
      set.call(this, value);
    },
  };
};

export default internal;
