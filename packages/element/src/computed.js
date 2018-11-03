import assertKind from '@corpuscule/utils/lib/assertKind';

const createComputingPair = () => {
  const dirty = Symbol();

  const computed = ({
    descriptor: {get, set},
    key,
    kind,
    placement,
  }) => {
    assertKind('computed', 'getter', kind, get && !set);

    const storage = Symbol();
    const extrasPlacement = placement === 'static' ? 'static' : 'own';

    return {
      descriptor: {
        configurable: true,
        enumerable: true,
        get() {
          if (this[dirty]) {
            this[storage] = get.call(this);
            this[dirty] = false;
          }

          return this[storage];
        },
      },
      extras: [
        {
          descriptor: {},
          key: storage,
          kind: 'field',
          placement: extrasPlacement,
        }, {
          descriptor: {},
          initializer: () => true,
          key: dirty,
          kind: 'field',
          placement: extrasPlacement,
        },
      ],
      key,
      kind,
      placement,
    };
  };

  const observer = ({
    descriptor: {get: previousGet, set: previousSet},
    key,
    kind,
    initializer,
    placement,
  }) => {
    const isMethod = kind === 'method';

    assertKind(
      'observer',
      'field or accessor',
      kind,
      // eslint-disable-next-line no-extra-parens
      kind === 'field' || (
        isMethod && (
          previousGet || previousSet
        )
      ),
    );

    let get;
    let set;
    let initializerDescriptor;

    if (isMethod) {
      get = previousGet;
      set = previousSet;
    } else {
      const storage = Symbol();

      /* eslint-disable no-shadow, no-invalid-this */
      get = function get() {
        return this[storage];
      };

      set = function set(value) {
        this[storage] = value;
      };
      /* eslint-enable no-shadow, no-invalid-this */

      initializerDescriptor = {
        descriptor: {},
        initializer,
        key: storage,
        kind: 'field',
        placement: placement === 'static' ? 'static' : 'own',
      };
    }

    return {
      descriptor: {
        configurable: true,
        enumerable: true,
        get,
        set(value) {
          set.call(this, value);
          this[dirty] = true;
        },
      },
      extras: initializerDescriptor ? [initializerDescriptor] : undefined,
      key,
      kind: 'method',
      placement: placement === 'own' ? 'prototype' : placement,
    };
  };

  return {computed, observer};
};

export default createComputingPair;
