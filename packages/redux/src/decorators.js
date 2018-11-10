import addToRegistry from '@corpuscule/utils/lib/addToRegistry';
import {assertKind} from '@corpuscule/utils/lib/asserts';
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

  if (kind === 'field') {
    const initialized = initializer ? initializer() : undefined;

    if (!initialized || typeof initialized !== 'function') {
      throw new Error(`@dispatcher: "${key}" should be initialized with a function`);
    }

    return {
      descriptor,
      initializer() {
        return (...args) => {
          this[$$context].dispatch(initialized.apply(this, args));
        };
      },
      key,
      kind,
      placement,
    };
  }

  return {
    descriptor,
    extras: [{
      descriptor: {
        configurable: true,
      },
      initializer() {
        return (...args) => {
          this[$$context].dispatch(descriptor.value.apply(this, args));
        };
      },
      key,
      kind: 'field',
      placement: 'own',
    }],
    key,
    kind,
    placement,
  };
};
