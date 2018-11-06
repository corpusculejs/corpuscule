import {assertElementDecoratorsKindAndPlacement} from '../utils';

const fromAttribute = (instance, name, guard) => {
  const value = instance.getAttribute(name);

  if (guard === Boolean) {
    return value !== null;
  }

  return value !== null
    ? guard === String ? value : guard(value)
    : null;
};

const toAttribute = (instance, name, value) => {
  if (value === undefined || value === false) {
    instance.removeAttribute(name);
  } else {
    instance.setAttribute(name, value === true ? '' : value);
  }
};

const attribute = (name, guard) => ({
  key,
  kind,
  placement,
}) => {
  assertElementDecoratorsKindAndPlacement('attribute', kind, placement);

  if (guard !== Boolean && guard !== Number && guard !== String) {
    throw new TypeError('Guard for @attribute should be either Number, Boolean or String');
  }

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
    },
    key,
    kind: 'method',
    placement: 'prototype',
  };
};

export default attribute;
