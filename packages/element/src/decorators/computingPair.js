import {assertKind, assertPlacement} from '@corpuscule/utils/lib/asserts';
import {accessor, field} from '@corpuscule/utils/lib/descriptors';

const createComputingPair = () => {
  const registry = Symbol();

  const computer = ({
    descriptor: {get, set},
    key,
    kind,
    placement,
  }) => {
    assertKind('computed', 'getter', kind, {correct: get && !set});
    assertPlacement('computed', 'prototype', placement);

    const storage = Symbol();
    const pristine = Symbol();

    return accessor({
      extras: [
        field({
          key: storage,
        }, {isPrivate: true}),
        field({
          initializer: () => false,
          key: pristine,
        }, {isPrivate: true}),
      ],
      finisher(target) {
        if (target[registry]) {
          target[registry].push(pristine);
        } else {
          target[registry] = [pristine];
        }
      },
      get() {
        if (!this[pristine]) {
          this[storage] = get.call(this);
          this[pristine] = true;
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

    assertKind('observer', 'field or accessor', kind, {
      correct: kind === 'field' || ( // eslint-disable-line no-extra-parens
        isMethod && previousGet && previousSet
      ),
    });
    assertPlacement('observer', 'own or prototype', placement, {
      correct: placement === 'own' || placement === 'prototype',
    });

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

      initializerDescriptor = field({
        initializer,
        key: storage,
      }, {isPrivate: true});
    }

    return accessor({
      ...descriptor,
      extras: initializerDescriptor ? [initializerDescriptor] : undefined,
      key,
      set(value) {
        descriptor.set.call(this, value);

        for (const pristine of this.constructor[registry]) {
          this[pristine] = false;
        }
      },
    });
  };

  return {computer, observer};
};

export default createComputingPair;
