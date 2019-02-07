import {assertKind, assertPlacement, Kind, Placement} from '@corpuscule/utils/lib/asserts';
import {accessor, field} from '@corpuscule/utils/lib/descriptors';
import {assertElementProperty} from './utils';

const createComputingPair = () => {
  const registry = new WeakMap();

  const computer = descriptor => {
    assertKind('computer', Kind.Getter, descriptor);
    assertPlacement('computer', Placement.Prototype, descriptor);

    const {
      descriptor: {get},
      key,
    } = descriptor;

    const storage = Symbol();
    const correct = Symbol();

    return accessor({
      extras: [
        field({
          key: storage,
        }),
        field({
          initializer: () => false,
          key: correct,
        }),
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

  const observer = descriptor => {
    assertElementProperty('observer', descriptor);

    const {
      descriptor: {get, set},
      initializer,
      key,
    } = descriptor;

    return accessor({
      adjust({get: originalGet, set: originalSet}) {
        return {
          get: originalGet,
          set(value) {
            originalSet.call(this, value);

            for (const correct of registry.get(this.constructor)) {
              this[correct] = false;
            }
          },
        };
      },
      get,
      initializer,
      key,
      set,
    });
  };

  return {computer, observer};
};

export default createComputingPair;