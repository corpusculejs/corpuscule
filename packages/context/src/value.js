import {assertKind, assertPlacement, Kind, Placement} from '@corpuscule/utils/lib/asserts';
import {accessor, hook} from '@corpuscule/utils/lib/descriptors';

const createValue = ({consumers, value, providers}, defaultValue) => descriptor => {
  assertKind('value', Kind.Field | Kind.Method | Kind.Accessor, descriptor);
  assertPlacement('value', Placement.Own | Placement.Prototype, descriptor);

  const {initializer, key} = descriptor;

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
    initializer() {
      if (isProvider) {
        return initializer ? initializer.call(this) : defaultValue;
      }

      return undefined;
    },
    key,
  });
};

export default createValue;
