import {assertKind, assertPlacement} from '@corpuscule/utils/lib/asserts';
import {method} from '@corpuscule/utils/lib/descriptors';
import {getValue} from '@corpuscule/utils/lib/propertyUtils';

export const createDispatcherDecorator = ({store}) => propertyDescriptor => {
  const {
    descriptor: {value},
    initializer,
    key,
    kind,
    placement,
  } = propertyDescriptor;

  assertKind('dispatcher', 'field or method', kind, {
    correct: kind === 'method' || kind === 'field',
  });
  assertPlacement('dispatcher', 'own or prototype', placement, {
    correct: placement === 'own' || placement === 'prototype',
  });

  let $store;

  const finisher = target => {
    $store = store.get(target);
  };

  if (kind === 'field') {
    const actionCreator = initializer && initializer();

    if (!actionCreator || typeof actionCreator !== 'function') {
      throw new TypeError(`@dispatcher "${key}" should be initialized with a function`);
    }

    return method({
      finisher,
      key,
      method(...args) {
        getValue(this, $store).dispatch(actionCreator(...args));
      },
      placement: 'own',
    });
  }

  return {
    ...propertyDescriptor,
    extras: [
      method({
        key,
        method(...args) {
          getValue(this, $store).dispatch(value.apply(this, args));
        },
        placement: 'own',
      }),
    ],
    finisher,
  };
};
