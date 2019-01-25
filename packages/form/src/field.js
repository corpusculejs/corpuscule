import {assertKind, assertPlacement} from '@corpuscule/utils/lib/asserts';
import * as $ from '@corpuscule/utils/lib/descriptors';
import defaultScheduler from '@corpuscule/utils/lib/scheduler';
import shallowEqual from '@corpuscule/utils/lib/shallowEqual';
import {input as $input, meta as $meta} from './tokens/lifecycle';
import {all, getTargetValue} from './utils';
import getSupers from '@corpuscule/utils/lib/getSupers';

const [connectedCallbackKey, disconnectedCallbackKey] = $.lifecycleKeys;

const noop = () => {}; // eslint-disable-line no-empty-function

const configOptions = [
  'format',
  'formatOnBlur',
  'isEqual',
  'name',
  'parse',
  'subscription',
  'validate',
  'validateFields',
  'value',
];

const configPropertyNames = new Map(configOptions.map(option => [option, new WeakMap()]));
const subscribePropertyName = new WeakMap();
const updatePropertyName = new WeakMap();

const getConfigProperties = (self, ...keys) =>
  keys.map(key => {
    const name = configPropertyNames.get(key).get(self.constructor);

    if (typeof name === 'string' || typeof name === 'symbol') {
      return self[name];
    }

    return undefined;
  });

export const fieldOption = configKey => ({descriptor, initializer, key, kind, placement}) => {
  const {get, set, value} = descriptor;

  assertKind('fieldOption', 'not class', kind, {
    correct: kind !== 'class',
  });
  assertPlacement('fieldOption', 'own or prototype', placement, {
    correct: placement === 'own' || placement === 'prototype',
  });

  if (!configOptions.includes(configKey)) {
    throw new TypeError(`"${configKey}" is not one of the Final Form Field configuration keys`);
  }

  const finisher = target => {
    configPropertyNames.get(configKey).set(target, key);
  };

  if (kind === 'method' && value) {
    return {
      descriptor,
      extras: [
        $.method({
          bound: true,
          key,
          method: value,
        }),
      ],
      finisher,
      key,
      kind,
      placement,
    };
  }

  return $.accessor({
    adjust({get: originalGet, set: originalSet}) {
      return {
        get: originalGet,
        set:
          configKey === 'name' || configKey === 'subscription'
            ? function(v) {
                const oldValue = originalGet.call(this);
                originalSet.call(this, v);

                if (configKey === 'name' ? v !== oldValue : !shallowEqual(v, oldValue)) {
                  this[subscribePropertyName.get(this.constructor)]();
                }
              }
            : function(v) {
                if (v !== originalGet.call(this)) {
                  this[updatePropertyName.get(this.constructor)]();
                }

                originalSet.call(this, v);
              },
      };
    },
    finisher,
    get,
    initializer,
    key,
    set,
  });
};

const createField = (consumer, $formApi, $$form) => {
  const filterNames = [$formApi, $input, $meta];

  return ({scheduler = defaultScheduler} = {}) => classDescriptor => {
    assertKind('field', 'class', classDescriptor.kind);

    const $$formState = Symbol();
    const $$onBlur = Symbol();
    const $$onChange = Symbol();
    const $$onFocus = Symbol();
    const $$subscribe = Symbol();
    const $$subscribingValid = Symbol();
    const $$unsubscribe = Symbol();
    const $$update = Symbol();
    const $$updatingValid = Symbol();

    const {elements, kind} = consumer(classDescriptor);
    const [supers, finish] = getSupers(elements, $.lifecycleKeys);

    return {
      elements: [
        ...elements.filter(({key}) => !filterNames.includes(key)),

        // Public
        $.method({
          key: connectedCallbackKey,
          method() {
            this.addEventListener('blur', this[$$onBlur]);
            this.addEventListener('change', this[$$onChange]);
            this.addEventListener('focus', this[$$onFocus]);

            supers[connectedCallbackKey].call(this);
            this[$$subscribe]();
          },
          placement: 'own',
        }),
        $.method({
          key: disconnectedCallbackKey,
          method() {
            this.removeEventListener('blur', this[$$onBlur]);
            this.removeEventListener('change', this[$$onChange]);
            this.removeEventListener('focus', this[$$onFocus]);

            this[$$unsubscribe]();
            supers[disconnectedCallbackKey].call(this);
          },
          placement: 'own',
        }),

        // Protected
        $.accessor({
          get() {
            return this[$$form];
          },
          key: $formApi,
        }),

        // Private
        $.field({
          initializer: () => true,
          key: $$subscribingValid,
        }),
        $.field({
          initializer: () => noop,
          key: $$unsubscribe,
        }),
        $.field({
          initializer: () => true,
          key: $$updatingValid,
        }),
        $.method({
          bound: true,
          key: $$onBlur,
          method() {
            const [format, formatOnBlur] = getConfigProperties(this, 'format', 'formatOnBlur');

            const {blur, change, name, value} = this[$$formState];

            blur();

            if (format && formatOnBlur) {
              change(format(value, name));
            }
          },
        }),
        $.method({
          bound: true,
          key: $$onChange,
          method({detail, target}) {
            const [parse] = getConfigProperties(this, 'parse');
            const {change, name, value} = this[$$formState];

            const changeValue = detail || getTargetValue(target, value);

            change(parse ? parse(changeValue, name) : changeValue);
          },
        }),
        $.method({
          bound: true,
          key: $$onFocus,
          method() {
            this[$$formState].focus();
          },
        }),
        $.method({
          key: $$subscribe,
          method() {
            if (!this[$$subscribingValid]) {
              return;
            }

            this[$$subscribingValid] = false;

            scheduler(() => {
              this[$$unsubscribe]();

              const [isEqual, name, subscription, validateFields] = getConfigProperties(
                this,
                'isEqual',
                'name',
                'subscription',
                'validateFields',
              );

              const listener = state => {
                this[$$formState] = state;
                this[$$update]();
              };

              this[$$unsubscribe] = this[$$form].registerField(
                name,
                listener,
                subscription || all,
                {
                  getValidator: () => getConfigProperties(this, 'validate')[0],
                  isEqual,
                  validateFields,
                },
              );

              this[$$subscribingValid] = true;
            });
          },
        }),
        $.method({
          key: $$update,
          method() {
            if (!this[$$updatingValid]) {
              return;
            }

            this[$$updatingValid] = false;

            scheduler(() => {
              const [format, formatOnBlur] = getConfigProperties(this, 'format', 'formatOnBlur');

              const {blur: _b, change: _c, focus: _f, name, length: _l, value, ...meta} = this[
                $$formState
              ];

              this[$input] = {
                name,
                value: !formatOnBlur && format ? format(value, name) : value,
              };

              this[$meta] = meta;
              this[$$updatingValid] = true;
            });
          },
        }),
      ],
      finisher(target) {
        subscribePropertyName.set(target, $$subscribe);
        updatePropertyName.set(target, $$update);
        finish(target);
      },
      kind,
    };
  };
};

export default createField;
