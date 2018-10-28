import useInitializer from "@corpuscule/utils/lib/useInitializer";
import {assertElementDecoratorsKindAndPlacement} from "../utils";
import {invalidate as $$invalidate} from "../tokens/internal";
import {propsChangedStage} from "../tokens/stages";
import {oldValueRegistry} from "../getOldValue";

export const attributeRegistry = new WeakMap();

const parseAttributeValue = (value, guard) => {
  switch (guard) {
    case Boolean:
      return value !== null;
    case Number:
      return Number(value);
    default:
      return String(value);
  }
};

const toAttribute = (instance, attributeName, value) => {
  if (typeof value === "boolean") {
    if (value) {
      instance.setAttribute(attributeName, "");
    } else {
      instance.removeAttribute(attributeName);
    }
  } else {
    instance.setAttribute(attributeName, String(value));
  }
};

const attribute = (attributeName, guard) => ({
  initializer,
  key,
  kind,
  placement,
}) => {
  assertElementDecoratorsKindAndPlacement("attribute", kind, placement);

  const guardType = guard.name.toLowerCase();
  const check = (value) => {
    if (typeof value !== guardType) {
      throw new TypeError(`Value applied to "${key}" is not ${guard.name}`);
    }
  };

  return {
    descriptor: {
      configurable: true,
      enumerable: true,
      get() {
        return parseAttributeValue(this.getAttribute(attributeName), guard);
      },
      set(value) {
        check(value);

        const oldValue = parseAttributeValue(this.getAttribute(attributeName), guard);

        if (value === oldValue) {
          return;
        }

        oldValueRegistry.get(this).set(key, oldValue);
        toAttribute(this, attributeName, value);

        this[$$invalidate](propsChangedStage);
      },
    },
    extras: [
      useInitializer((instance) => {
        const value = initializer.call(instance);
        check(value);
        toAttribute(instance, value);
        oldValueRegistry.set(instance, new Map([[key, undefined]]));
      }),
    ],
    finisher(target) {
      if (attributeRegistry.has(target)) {
        attributeRegistry.get(target).push(attributeName);
      } else {
        attributeRegistry.set(target, [attributeName]);
      }
    },
    key,
    kind: "method",
    placement: "prototype",
  };
};

export default attribute;
