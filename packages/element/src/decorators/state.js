import {assertElementDecoratorsKindAndPlacement} from '../utils';
import {stateChangedCallback as $stateChangedCallback} from '../tokens/lifecycle';

const state = ({
  initializer,
  key,
  kind,
  placement,
}) => {
  assertElementDecoratorsKindAndPlacement('state', kind, placement);

  const storage = Symbol();

  return {
    descriptor: {
      configurable: true,
      enumerable: true,
      get() {
        return this[storage];
      },
      set(value) {
        this[$stateChangedCallback](key, this[storage], value);
        this[storage] = value;
      },
    },
    extras: [
      {
        descriptor: {
          writable: true,
        },
        initializer,
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

export default state;
