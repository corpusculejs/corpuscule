import {assertKind, assertPlacement} from '@corpuscule/utils/lib/asserts';
import {accessor} from '@corpuscule/utils/lib/descriptors';

export const createUnitDecorator = ({units}) => getter => descriptor => {
  const {
    descriptor: {get, set},
    key,
    kind,
    placement,
  } = descriptor;

  assertKind('unit', 'field or accessor', kind, {
    correct: kind === 'field' || (kind === 'method' && get && set),
  });

  assertPlacement('unit', 'own or prototype', placement, {
    correct: placement === 'own' || placement === 'prototype',
  });

  return accessor({
    ...descriptor,
    finisher(target) {
      units.get(target).set(key, getter);
    },
  });
};
