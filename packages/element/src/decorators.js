import addToRegistry from "@corpuscule/utils/lib/addToRegistry";
import assertKind from "@corpuscule/utils/lib/assertKind";
import {
  defaultPropertyOptions,
  handleError,
  prepareComputed,
  toAttribute,
} from "./utils";
import {
  invalidate as $$invalidate,
  isMount as $$isMount,
  props as $$props, states as $$states,
} from "./tokens/internal";

export const attributeRegistry = new WeakMap();

export const propertyInitializerRegistry = new WeakMap();

export const stateInitializerRegistry = new WeakMap();

export const attribute = (attributeName, guard, {pure} = defaultPropertyOptions) => ({
  initializer,
  key,
  kind,
}) => {
  assertKind("attribute", "field", kind);

  return {
    descriptor: {
      configurable: true,
      enumerable: true,
      get() {
        return this[$$props][key];
      },
      set(value) {
        const {[$$props]: props} = this;

        if (pure && value === props[key]) {
          return;
        }

        if (typeof value !== guard.name.toLowerCase()) {
          throw new TypeError(`Value applied to "${key}" is not ${guard.name}`);
        }

        props[key] = value;

        if (this[$$isMount]) {
          toAttribute(this, attributeName, value);
        }

        this[$$invalidate]("props").catch(handleError);
      },
    },
    finisher(target) {
      addToRegistry(attributeRegistry, target, attributeName, [key, guard]);
      addToRegistry(propertyInitializerRegistry, target, key, initializer);
    },
    key,
    kind: "method",
    placement: "prototype",
  };
};

export const property = (guard = null, {pure} = defaultPropertyOptions) => ({
  initializer,
  key,
  kind,
}) => {
  assertKind("property", "field", kind);

  return {
    descriptor: {
      configurable: true,
      enumerable: true,
      get() {
        return this[$$props][key];
      },
      set(value) {
        const {[$$props]: props} = this;

        if (pure && value === props[key]) {
          return;
        }

        if (guard && !guard(value)) {
          throw new TypeError(`Value applied to "${key}" has wrong type`);
        }

        props[key] = value;

        this[$$invalidate]("props").catch(handleError);
      },
    },
    finisher(target) {
      addToRegistry(propertyInitializerRegistry, target, key, initializer);
    },
    key,
    kind: "method",
    placement: "prototype",
  };
};

export const state = ({initializer, key, kind}) => {
  assertKind("state", "field", kind);

  return {
    descriptor: {
      configurable: true,
      enumerable: true,
      get() {
        return this[$$states][key];
      },
      set(value) {
        this[$$states][key] = value;
        this[$$invalidate]("states").catch(handleError);
      },
    },
    finisher(target) {
      addToRegistry(stateInitializerRegistry, target, key, initializer);
    },
    key,
    kind: "method",
    placement: "prototype",
  };
};

export const element = name => ({kind, elements}) => {
  assertKind("element", "class", kind);

  return {
    elements: [
      ...elements.filter(({key}) => key !== "is"),
      {
        descriptor: {
          configurable: true,
          get() {
            return name;
          },
        },
        key: "is",
        kind: "method",
        placement: "static",
      },
    ],
    finisher(target) {
      customElements.define(name, target);
    },
    kind,
  };
};

export const computed = (...watchings) => ({
  descriptor: {get},
  key,
  kind,
  placement,
}) => {
  assertKind("computed", "getter", kind, !get);

  const registry = new WeakMap();

  return {
    descriptor: {
      configurable: true,
      get() {
        const computedData = prepareComputed(
          this,
          key,
          registry,
          watchings,
          get,
        );

        const {cache} = computedData;
        let isValueUpdated = false;

        for (const [watchingProperty, watchingValue] of cache) {
          if (this[watchingProperty] !== watchingValue) {
            if (!isValueUpdated) {
              computedData.value = get.call(this);
              isValueUpdated = true;
            }

            cache.set(watchingProperty, this[watchingProperty]);
          }
        }

        isValueUpdated = false;

        return computedData.value;
      },
    },
    key,
    kind,
    placement,
  };
};
