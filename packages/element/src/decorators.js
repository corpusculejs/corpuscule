import addToRegistry from '@corpuscule/utils/lib/addToRegistry';
import assertKind from '@corpuscule/utils/lib/assertKind';
import {
  invalidate as $$invalidate,
  isMount as $$isMount,
  props as $$props,
  states as $$states,
} from './tokens/internal';
import {
  propsChangedStage,
  stateChangedStage,
} from './tokens/stages';
import {
  defaultPropertyOptions,
  toAttribute,
} from './utils';
import {unsafeStatic} from './dhtml';

export const attributeRegistry = new WeakMap();

export const propertyInitializerRegistry = new WeakMap();

export const stateInitializerRegistry = new WeakMap();

export const attribute = (attributeName, guard, {pure} = defaultPropertyOptions) => ({
  initializer,
  key,
  kind,
}) => {
  assertKind('attribute', 'field', kind);

  const guardingType = guard.name.toLowerCase();

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

        if (typeof value !== guardingType) {
          throw new TypeError(`Value applied to "${key}" is not ${guard.name}`);
        }

        props[key] = value;

        if (this[$$isMount]) {
          toAttribute(this, attributeName, value);
        }

        this[$$invalidate](propsChangedStage);
      },
    },
    finisher(target) {
      addToRegistry(attributeRegistry, target, attributeName, [key, guard]);
      addToRegistry(propertyInitializerRegistry, target, key, initializer);
    },
    key,
    kind: 'method',
    placement: 'prototype',
  };
};

export const property = (guard = null, {pure} = defaultPropertyOptions) => ({
  initializer,
  key,
  kind,
}) => {
  assertKind('property', 'field', kind);

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

        this[$$invalidate](propsChangedStage);
      },
    },
    finisher(target) {
      addToRegistry(propertyInitializerRegistry, target, key, initializer);
    },
    key,
    kind: 'method',
    placement: 'prototype',
  };
};

export const state = ({initializer, key, kind}) => {
  assertKind('state', 'field', kind);

  return {
    descriptor: {
      configurable: true,
      enumerable: true,
      get() {
        return this[$$states][key];
      },
      set(value) {
        this[$$states][key] = value;
        this[$$invalidate](stateChangedStage);
      },
    },
    finisher(target) {
      addToRegistry(stateInitializerRegistry, target, key, initializer);
    },
    key,
    kind: 'method',
    placement: 'prototype',
  };
};

export const element = name => ({kind, elements}) => {
  assertKind('element', 'class', kind);

  const tag = unsafeStatic(name);

  return {
    elements: [
      ...elements.filter(({key}) => key !== 'is'),
      {
        descriptor: {
          configurable: true,
          get() {
            return name;
          },
        },
        key: 'is',
        kind: 'method',
        placement: 'static',
      },
      {
        descriptor: {
          configurable: true,
          get() {
            return tag;
          },
        },
        key: 'tag',
        kind: 'method',
        placement: 'static',
      },
    ],
    finisher(target) {
      customElements.define(name, target);
    },
    kind,
  };
};
