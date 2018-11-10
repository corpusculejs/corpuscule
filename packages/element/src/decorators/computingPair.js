import {assertKind, assertPlacement} from '@corpuscule/utils/lib/asserts';
import {accessor, privateField} from '@corpuscule/utils/lib/descriptors';

const createComputingPair = () => {
  const dirty = Symbol();

  const computer = ({
    descriptor: {get, set},
    key,
    kind,
    placement,
  }) => {
    assertKind('computed', 'getter', kind, get && !set);
    assertPlacement('attribute', 'own', placement);

    const storage = Symbol();

    return accessor({
      extras: [
        privateField({
          key: storage,
        }),
        privateField({
          initializer: () => true,
          key: dirty,
        }),
      ],
      get() {
        if (this[dirty]) {
          this[storage] = get.call(this);
          this[dirty] = false;
        }

        return this[storage];
      },
      key,
    });
  };

  const observer = ({
    descriptor: {get: previousGet, set: previousSet},
    initializer,
    key,
    kind,
    placement,
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
    assertPlacement('attribute', 'own', placement);

    let descriptor;
    let initializerDescriptor;

    if (isMethod) {
      descriptor = {
        get: previousGet,
        set: previousSet,
      };
    } else {
      const storage = Symbol();

      descriptor = {
        get() {
          return this[storage];
        },
        set(value) {
          this[storage] = value;
        },
      };

      initializerDescriptor = privateField({
        initializer,
        key: storage,
      });
    }

    return accessor({
      extras: initializerDescriptor ? [initializerDescriptor] : undefined,
      get: descriptor.get,
      key,
      set(value) {
        descriptor.set.call(this, value);
        this[dirty] = true;
      },
    });
  };

  return {computer, observer};
};

export default createComputingPair;
