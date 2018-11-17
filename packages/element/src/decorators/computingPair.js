import {assertKind, assertPlacement} from '@corpuscule/utils/lib/asserts';
import createDualDescriptor from '@corpuscule/utils/lib/createDualDescriptor';
import {accessor, field} from '@corpuscule/utils/lib/descriptors';

const createComputingPair = () => {
  const registry = new WeakMap();

  const computer = ({
    descriptor: {get, set},
    key,
    kind,
    placement,
  }) => {
    assertKind('computed', 'getter', kind, {correct: get && !set});
    assertPlacement('computed', 'prototype', placement);

    const storage = Symbol();
    const correct = Symbol();

    return accessor({
      extras: [
        field({
          key: storage,
        }, {isPrivate: true}),
        field({
          initializer: () => false,
          key: correct,
        }, {isPrivate: true}),
      ],
      finisher(target) {
        if (registry.has(target)) {
          registry.get(target).push(correct);
        } else {
          registry.set(target, [correct]);
        }
      },
      get() {
        if (!this[correct]) {
          this[storage] = get.call(this);
          this[correct] = true;
        }

        return this[storage];
      },
      key,
    });
  };

  const observer = ({
    descriptor,
    initializer,
    key,
    kind,
    placement,
  }) => {
    const isMethod = kind === 'method';

    assertKind('observer', 'field or accessor', kind, {
      // eslint-disable-next-line no-extra-parens
      correct: kind === 'field' || (isMethod && descriptor.get && descriptor.set),
    });
    assertPlacement('observer', 'own or prototype', placement, {
      correct: placement === 'own' || placement === 'prototype',
    });

    const [
      {get, set},
      initializerDescriptor,
    ] = createDualDescriptor(descriptor, initializer);

    return accessor({
      extras: initializerDescriptor ? [initializerDescriptor] : undefined,
      get,
      key,
      set(value) {
        set.call(this, value);

        for (const correct of registry.get(this.constructor)) {
          this[correct] = false;
        }
      },
    });
  };

  return {computer, observer};
};

export default createComputingPair;
