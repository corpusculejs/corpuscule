import {assertElementDecoratorsKind} from '../utils';
import {stateChangedCallback as $stateChangedCallback} from '../tokens/lifecycle';
import {accessor, field} from '@corpuscule/utils/lib/descriptors';
import {assertPlacement} from '@corpuscule/utils/lib/asserts';

const state = ({
  initializer,
  key,
  kind,
  placement,
}) => {
  assertElementDecoratorsKind('state', kind);
  assertPlacement('state', 'own', placement);

  const storage = Symbol();

  return accessor({
    extras: [
      field({
        initializer,
        key: storage,
      }, {isPrivate: true}),
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
