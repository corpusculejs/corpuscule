import {assertElementDecoratorsKind} from '../utils';
import {internalChangedCallback as $internalChangedCallback} from '../tokens/lifecycle';
import {accessor, field} from '@corpuscule/utils/lib/descriptors';
import {assertPlacement} from '@corpuscule/utils/lib/asserts';

const internal = ({initializer, key, kind, placement}) => {
  assertElementDecoratorsKind('internal', kind);
  assertPlacement('internal', 'own', placement);

  const storage = Symbol();

  return accessor({
    extras: [
      field(
        {
          initializer,
          key: storage,
        },
        {isPrivate: true},
      ),
    ],
    get() {
      return this[storage];
    },
    key,
    set(value) {
      this[$internalChangedCallback](key, this[storage], value);
      this[storage] = value;
    },
  });
};

export default internal;
