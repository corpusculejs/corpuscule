import {assertElementDecoratorsKindAndPlacement} from '../utils';
import {stateChangedCallback as $stateChangedCallback} from '../tokens/lifecycle';
import {accessor, privateField} from '@corpuscule/utils/lib/descriptors';

const state = ({
  initializer,
  key,
  kind,
  placement,
}) => {
  assertElementDecoratorsKindAndPlacement('state', kind, placement);

  const storage = Symbol();

  return accessor({
    extras: [
      privateField({
        initializer,
        key: storage,
      }),
    ],
    get() {
      return this[storage];
    },
    key,
    set(value) {
      this[$stateChangedCallback](key, this[storage], value);
      this[storage] = value;
    },
  });
};

export default state;
