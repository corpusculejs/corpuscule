import {assertKind, assertPlacement} from '@corpuscule/utils/lib/asserts';
import {accessor} from '@corpuscule/utils/lib/descriptors';

export const createUnitDecorator = ({units}) => getter => ({
  descriptor: {get, set},
  initializer,
  key,
  kind,
  placement,
}) => {
  assertKind('unit', 'field or accessor', kind, {
    correct: kind === 'field' || (kind === 'method' && get && set),
  });

  assertPlacement('unit', 'own or prototype', placement, {
    correct: placement === 'own' || placement === 'prototype',
  });

  const storage = Symbol();

  const {extras, ...storageAccessor} = accessor({
    adjust: ({get: originalGet, set: originalSet}) => ({
      get: originalGet,
      set(store) {
        const value = getter(store);

        if (originalGet.call(this) !== value) {
          originalSet.call(this, getter(store));
        }
      },
    }),
    get,
    initializer,
    key: storage,
    set,
  });

  return accessor({
    extras: [...(extras || []), storageAccessor],
    finisher(target) {
      units.get(target).push(storage);
    },
    get() {
      return this[storage];
    },
    key,
  });
};
