import {invalidate as $$invalidate} from '../tokens/internal';
import {assertElementDecoratorsKindAndPlacement} from '../utils';

const preparations = new WeakSet();
const mountingPhase = new WeakMap();

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
        mountingPhase.set(this, true);
        toAttribute(this, name, value);
        mountingPhase.set(this, false);
      };

      if (preparations.has(target)) {
        return;
      }

      const superAttributeChangedCallback = target.prototype.attributeChangedCallback;

      target.prototype.attributeChangedCallback =
        function attributeChangedCallback(attributeName, oldVal, newVal) {
          if (oldVal === newVal || mountingPhase.get(this)) {
            return;
          }

          if (superAttributeChangedCallback) {
            superAttributeChangedCallback.call(this, attributeName, oldVal, newVal);
          }

          this[$$invalidate]();
        };

      preparations.add(target);
    },
    key,
    kind: 'method',
    placement: 'prototype',
  };
};

export default attribute;
