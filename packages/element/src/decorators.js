import {defaultPropertyOptions, handleError, prepareComputed, toAttribute} from "./utils";
import {
  invalidate as $$invalidate,
  isMount as $$isMount,
  props as $$props, states as $$states,
} from "./tokens/internal";

export const attributeRegistry = new WeakMap();

export const attribute = (attributeName, guard, {pure} = defaultPropertyOptions) => (prototype, propertyName) => {
  const record = [attributeName, [propertyName, guard]];

  if (attributeRegistry.has(prototype)) {
    attributeRegistry.get(prototype).set(...record);
  } else {
    attributeRegistry.set(prototype, new Map([record]));
  }

  return {
    configurable: true,
    get() {
      return this[$$props][propertyName];
    },
    set(value) {
      const {[$$props]: props} = this;

      if (pure && value === props[propertyName]) {
        return;
      }

      if (typeof value !== guard.name.toLowerCase()) {
        throw new TypeError(`Value applied to "${propertyName}" is not ${guard.name}`);
      }

      props[propertyName] = value;

      if (this[$$isMount]) {
        toAttribute(this, attributeName, value);
      }

      this[$$invalidate]("props")
        .catch(handleError);
    },
  };
};

export const property = (guard = null, {pure = defaultPropertyOptions.pure} = {}) => (_, propertyName) => ({
  configurable: true,
  get() {
    return this[$$props][propertyName];
  },
  set(value) {
    const {[$$props]: props} = this;

    if (pure && value === props[propertyName]) {
      return;
    }

    if (guard && !guard(value)) {
      throw new TypeError(`Value applied to "${propertyName}" has wrong type`);
    }

    props[propertyName] = value;

    this[$$invalidate]("props")
      .catch(handleError);
  },
});

export const state = (_, propertyName) => ({
  configurable: true,
  get() {
    return this[$$states][propertyName];
  },
  set(value) {
    this[$$states][propertyName] = value;
    this[$$invalidate]("states")
      .catch(handleError);
  },
});

export const computed = (...watchings) => (prototype, propertyName) => {
  const descriptor = Object.getOwnPropertyDescriptor(prototype, propertyName);

  if (!descriptor || !descriptor.get) {
    throw new Error(`Property "${propertyName}" is not defined or is not a getter`);
  }

  const {get} = descriptor;

  const registry = new WeakMap();

  return {
    configurable: true,
    get() {
      const computedData = prepareComputed(
        this,
        propertyName,
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
  };
};
