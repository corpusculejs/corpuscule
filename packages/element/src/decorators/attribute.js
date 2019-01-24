import {accessor} from '@corpuscule/utils/lib/descriptors';
import {assertKind, assertPlacement} from '@corpuscule/utils/lib/asserts';

const attribute = (name, guard) => ({key, kind, placement}) => {
  assertKind('attribute', 'field', kind);
  assertPlacement('attribute', 'own', placement);

  if (guard !== Boolean && guard !== Number && guard !== String) {
    throw new TypeError('Guard for @attribute should be either Number, Boolean or String');
  }

  const guardType = typeof guard(null);

  return accessor({
    finisher(target) {
      target.observedAttributes.push(name);
    },
    get() {
      const value = this.getAttribute(name);

      if (guard === Boolean) {
        return value !== null;
      }

      return value !== null ? (guard === String ? value : guard(value)) : null;
    },
    key,
    set(value) {
      if (value != null && typeof value !== guardType) {
        throw new TypeError(`Value applied to "${key}" is not ${guard.name} or undefined`);
      }

      if (value == null || value === false) {
        this.removeAttribute(name);
      } else {
        this.setAttribute(name, value === true ? '' : value);
      }
    },
  });
};

export default attribute;
