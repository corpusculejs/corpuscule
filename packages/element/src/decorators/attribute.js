import {assertElementDecoratorsKindAndPlacement} from "../utils";
import {
  attributeInitializers as $$attributeInitializers,
  attributes as $$attributes,
} from "../tokens/internal";

const assertGuard = (guard) => {
  if (guard !== Boolean && guard !== Number && guard !== String) {
    throw new TypeError("Guard for @attribute should be either Number, Boolean or String");
  }
};

const fromAttribute = (instance, name, guard) => {
  const value = instance.getAttribute(name);

  if (guard === Boolean) {
    return value !== null;
  }

  return value !== null
    ? guard(value)
    : undefined;
};

const toAttribute = (instance, name, value) => {
  if (value === undefined || value === false) {
    instance.removeAttribute(name);
  } else {
    instance.setAttribute(name, value === true ? "" : value);
  }
};

export const initAttributes = (instance) => {
  for (const property of instance.constructor[$$attributeInitializers]) {
    instance[property]();
  }
};

const attribute = (name, guard) => ({
  initializer,
  key,
  kind,
  placement,
}) => {
  assertElementDecoratorsKindAndPlacement("attribute", kind, placement);
  assertGuard(guard);

  const guardType = typeof guard(null);
  const check = (value) => {
    if (value !== undefined && typeof value !== guardType) {
      throw new TypeError(
        `Value applied to "${key}" is not ${guard.name} or undefined`
      );
    }
  };

  const attributeInitializer = Symbol();

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
    extras: [{
      descriptor: {},
      initializer() {
        return () => {
          if (this.hasAttribute(name)) {
            return;
          }

          const value = initializer ? initializer.call(this) : undefined;
          check(value);
          toAttribute(this, name, value);
        };
      },
      key: attributeInitializer,
      kind: "field",
      placement: "own",
    }],
    finisher(target) {
      if (!target[$$attributes]) {
        target[$$attributes] = [name];
        target[$$attributeInitializers] = [attributeInitializer];
      } else {
        target[$$attributes].push(name);
        target[$$attributeInitializers].push(attributeInitializer);
      }
    },
    key,
    kind: "method",
    placement: "prototype",
  };
};

export default attribute;
