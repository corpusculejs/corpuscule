import {makeAccessor} from '@corpuscule/utils/lib/descriptorsNew';
import {internalChangedCallback as $internalChangedCallback} from './tokens/lifecycle';
import {defaultDescriptor} from './utils';

const internal = ({constructor: target}, key, descriptor) => {
  const {get, set} = makeAccessor(target, descriptor);

  return {
    ...defaultDescriptor,
    get,
    set(value) {
      this[$internalChangedCallback](key, get.call(this), value);
      set.call(this, value);
    },
  };
};

export default internal;
