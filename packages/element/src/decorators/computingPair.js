import assertKind from '@corpuscule/utils/lib/assertKind';

const createComputingPair = () => {
  const dirty = Symbol();

  const computer = ({
    descriptor: {get, set},
    key,
    kind,
  }) => {
    assertKind('computed', 'getter', kind, get && !set);

    const storage = Symbol();

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
          descriptor: {
            writable: true,
          },
          key: storage,
          kind: 'field',
          placement: 'own',
        }, {
          descriptor: {
            writable: true,
          },
          initializer: () => true,
          key: dirty,
          kind: 'field',
          placement: 'own',
        },
      ],
      key,
      kind,
      placement: 'own',
    };
  };

  const observer = ({
    descriptor: {get: previousGet, set: previousSet},
    key,
    kind,
    initializer,
  }) => {
    const isMethod = kind === 'method';

    assertKind(
      'observer',
      'field or accessor',
      kind,
      // eslint-disable-next-line no-extra-parens
      kind === 'field' || (
        isMethod && previousGet && previousSet
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
        descriptor: {
          writable: true,
        },
        initializer,
        key: storage,
        kind: 'field',
        placement: 'own',
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
      placement: 'prototype',
    };
  };

  return {computer, observer};
};

export default createComputingPair;
