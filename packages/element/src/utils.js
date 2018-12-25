import {assertKind, assertPlacement} from '@corpuscule/utils/lib/asserts';

export const assertElementProperty = (decoratorName, get, set, kind, placement) => {
  assertKind(decoratorName, 'field or accessor', kind, {
    correct: kind === 'field' || (kind === 'method' && get && set),
  });

  assertPlacement(decoratorName, 'own or prototype', placement, {
    correct: placement === 'own' || placement === 'prototype',
  });
};
