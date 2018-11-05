import {assertElementDecoratorsKindAndPlacement} from '../utils';

const assertGuard = (guard) => {
  if (guard !== Boolean && guard !== Number && guard !== String) {
    throw new TypeError('Guard for @attribute should be either Number, Boolean or String');
  }
};

const fromAttribute = (instance, name, guard) => {
  const value = instance.getAttribute(name);

  if (guard === Boolean) {
    return value !== null;
  }

  return value !== null
    ? guard === String ? value : guard(value)
    : undefined;
};

const toAttribute = (instance, name, value) => {
  if (value === undefined || value === false) {
    instance.removeAttribute(name);
  } else {
    instance.setAttribute(name, value === true ? '' : value);
  }
};

const attribute = (name, guard) => ({
  initializer,
  key,
  kind,
  placement,
}) => {
  assertElementDecoratorsKindAndPlacement('attribute', kind, placement);
  assertGuard(guard);

  const guardType = typeof guard(null);
  const check = (value) => {
    if (value !== undefined && typeof value !== guardType) {
      throw new TypeError(
        `Value applied to "${key}" is not ${guard.name} or undefined`,
      );
    }
  };

  return {
    descriptor: {
      configurable: true,
      enumerable: true,
      get() {
        return fromAttribute(this, name, guard);
      },
      set(value) {
        check(value);
        toAttribute(this, name, value);
      },
    },
    finisher(target) {
      if (Array.isArray(target.observedAttributes)) {
        target.observedAttributes.push(name);
      } else {
        target.observedAttributes = [name];
      }

      const superConnectedCallback = target.prototype.connectedCallback;

      target.prototype.connectedCallback = function connectedCallback() {
        if (superConnectedCallback) {
          superConnectedCallback.call(this);
        }

        if (this.hasAttribute(name)) {
          return;
        }

        const value = initializer ? initializer.call(this) : undefined;
        check(value);
        toAttribute(this, name, value);
      };
    },
    key,
    kind: 'method',
    placement: 'prototype',
  };
};

export default attribute;
