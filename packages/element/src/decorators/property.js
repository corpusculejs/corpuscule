import {assertElementDecoratorsKind} from '../utils';
import {propertyChangedCallback as $propertyChangedCallback} from '../tokens/lifecycle';
import {accessor, field} from '@corpuscule/utils/lib/descriptors';
import {assertPlacement} from '@corpuscule/utils/lib/asserts';

const property = (guard = null) => ({initializer, key, kind, placement}) => {
  assertElementDecoratorsKind('property', kind);
  assertPlacement('property', 'own', placement);

  const storage = Symbol();

  const check = value => {
    if (guard && !guard(value)) {
      throw new TypeError(`Value applied to "${key}" has wrong type`);
    }
  };

  return accessor({
    extras: [
      field({
        initializer() {
          const value = initializer ? initializer.call(this) : undefined;
          check(value);

          return value;
        },
        key: storage,
      }),
    ],
    get() {
      return this[storage];
    },
    key,
    set(value) {
      check(value);
      this[$propertyChangedCallback](key, this[storage], value);
      this[storage] = value;
    },
  });
};

export default property;
