import {assertKind, assertPlacement, Kind, Placement} from '@corpuscule/utils/lib/asserts';
import {accessor, hook} from '@corpuscule/utils/lib/descriptors';

const createValue = ({consumers, value, providers}) => descriptor => {
  assertKind('value', Kind.Field | Kind.Method | Kind.Accessor, descriptor);
  assertPlacement('value', Placement.Own | Placement.Prototype, descriptor);

  const {
    descriptor: {get, set},
    initializer,
    key,
  } = descriptor;

  let $$consumers;
  let isProvider;

  return accessor({
    adjust: ({get: originalGet, set: originalSet}) => ({
      get: originalGet,
      set(v) {
        originalSet.call(this, v);

        if (isProvider) {
          for (const callback of this[$$consumers]) {
            callback(v);
          }
        }
      },
    }),
    extras: [
      hook({
        start() {
          value.set(this, key);
        },
      }),
    ],
    finisher(target) {
      isProvider = providers.has(target);
      $$consumers = consumers.get(target);
    },
    get,
    initializer() {
      return isProvider && initializer ? initializer.call(this) : undefined;
    },
    key,
    set,
  });
};

export default createValue;
