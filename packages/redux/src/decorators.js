import addToRegistry from '@corpuscule/utils/lib/addToRegistry';
import {assertKind, assertPlacement} from '@corpuscule/utils/lib/asserts';
import {method} from '@corpuscule/utils/lib/descriptors';
import {context as $$context} from './tokens/internal';

export const connectedRegistry = new WeakMap();

export const connected = getter => (descriptor) => {
  assertKind('connected', 'field', descriptor.kind);

  return {
    ...descriptor,
    finisher(target) {
      addToRegistry(connectedRegistry, target, descriptor.key, getter);
    },
  };
};

export const dispatcher = ({
  descriptor,
  initializer,
  key,
  kind,
  placement,
}) => {
  assertKind('dispatcher', 'field or method', kind, {
    correct: kind === 'method' || kind === 'field',
  });
  assertPlacement('dispatcher', 'own or prototype', placement, {
    correct: placement === 'own' || placement === 'prototype',
  });

  if (kind === 'field') {
    const initialized = initializer ? initializer() : undefined;

    if (!initialized || typeof initialized !== 'function') {
      throw new Error(`@dispatcher: "${key}" should be initialized with a function`);
    }

    return method({
      key,
      value(...args) {
        this[$$context].dispatch(initialized.apply(this, args));
      },
    }, {isBound: true});
  }

  return {
    descriptor,
    extras: [
      method({
        key,
        value(...args) {
          this[$$context].dispatch(descriptor.value.apply(this, args));
        },
      }, {isBound: true}),
    ],
    key,
    kind,
    placement,
  };
};
