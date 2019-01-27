import {assertKind, assertPlacement} from '@corpuscule/utils/lib/asserts';
import * as $ from '@corpuscule/utils/lib/descriptors';

const createValue = ({consumers, value, providers}, defaultValue) => ({
  descriptor: {get, set},
  initializer,
  key,
  kind,
  placement,
}) => {
  assertKind('formOption', 'properties, methods or full accessors', kind, {
    correct: kind === 'field' || (kind === 'method' && (value || (get && set))),
  });
  assertPlacement('formOption', 'own', placement);

  let $$consumers;
  let isProvider;

  return $.accessor({
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
    finisher(target) {
      value.set(target, key);
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
