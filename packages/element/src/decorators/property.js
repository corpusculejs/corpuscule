import {assertElementDecoratorsKindAndPlacement} from '../utils';
import {invalidate as $$invalidate} from '../tokens/internal';
import {propertyChangedCallback as $propertyChangedCallback} from '../tokens/lifecycle';

const property = (guard = null) => ({
  initializer,
  key,
  kind,
  placement,
}) => {
  assertElementDecoratorsKindAndPlacement('property', kind, placement);

  const storage = Symbol();

  const check = (value) => {
    if (guard && !guard(value)) {
      throw new TypeError(`Value applied to "${key}" has wrong type`);
    }
  };

  return {
    descriptor: {
      configurable: true,
      enumerable: true,
      get() {
        return this[storage];
      },
      set(value) {
        check(value);
        const oldValue = this[storage];

        if (value === oldValue) {
          return;
        }

        this[$propertyChangedCallback](key, oldValue, value);
        this[storage] = value;
        this[$$invalidate]();
      },
    },
    extras: [
      {
        descriptor: {},
        initializer() {
          const value = initializer ? initializer.call(this) : undefined;
          check(value);

          return value;
        },
        key: storage,
        kind: 'field',
        placement: 'own',
      },
    ],
    key,
    kind: 'method',
    placement: 'prototype',
  };
};

export default property;
