import addToRegistry from '@corpuscule/utils/lib/addToRegistry';
import {assertKind, assertPlacement} from '@corpuscule/utils/lib/asserts';
import {method} from '@corpuscule/utils/lib/descriptors';
import {contextMap} from './utils';

export const connectedRegistry = new WeakMap();

export const connected = getter => descriptor => {
  const {
    descriptor: {get, set},
    kind,
  } = descriptor;

  assertKind('connected', 'field or accessor', kind, {
    correct: kind === 'field' || (kind === 'method' && get && set), // eslint-disable-line no-extra-parens
  });

  return {
    ...descriptor,
    finisher(target) {
      addToRegistry(connectedRegistry, target, descriptor.key, getter);
    },
  };
};

export const dispatcher = ({descriptor, initializer, key, kind, placement}) => {
  assertKind('dispatcher', 'field or method', kind, {
    correct: kind === 'method' || kind === 'field',
  });
  assertPlacement('dispatcher', 'own or prototype', placement, {
    correct: placement === 'own' || placement === 'prototype',
  });

  if (kind === 'field') {
    const initialized = initializer ? initializer() : undefined;

    if (!initialized || typeof initialized !== 'function') {
      throw new TypeError(`@dispatcher: "${key}" should be initialized with a function`);
    }

    return method({
      key,
      method(...args) {
        this[contextMap.get(this.constructor)].dispatch(initialized(...args));
      },
      placement: 'own',
    });
  }

  return {
    descriptor,
    extras: [
      method({
        key,
        method(...args) {
          this[contextMap.get(this.constructor)].dispatch(descriptor.value.apply(this, args));
        },
        placement: 'own',
      }),
    ],
    key,
    kind,
    placement,
  };
};
