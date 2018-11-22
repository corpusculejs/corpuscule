import {assertKind, assertPlacement} from '@corpuscule/utils/lib/asserts';
import {
  accessor,
  field as ffield,
  method,
  lifecycleKeys,
} from '@corpuscule/utils/lib/descriptors';
import getSuperMethods from '@corpuscule/utils/lib/getSuperMethods';
import scheduler from '@corpuscule/utils/lib/scheduler';
import shallowEqual from '@corpuscule/utils/lib/shallowEqual';
import {consumer, contextValue as $$form} from './context';
import {
  formApi as $formApi,
  input as $input,
  meta as $meta,
  scheduler as $scheduler,
} from './tokens/field/lifecycle';
import {all} from './utils';

const [
  connectedCallbackKey,
  disconnectedCallbackKey,
] = lifecycleKeys;

const noop = () => {}; // eslint-disable-line no-empty-function

const configOptions = [
  'format',
  'formatOnBlur',
  'isEqual',
  'name',
  'parse',
  'subscription',
  'validate',
  'validateField',
  'value',
];

const configMap = new WeakMap();
const subscribe = new WeakMap();
const update = new WeakMap();

export const fieldConfig = configKey => ({
  descriptor,
  initializer,
  key,
  kind,
  placement,
}) => {
  const {get, set, value} = descriptor;

  assertKind('fieldConfig', 'not class', kind, {
    correct: kind !== 'class',
  });
  assertPlacement('fieldConfig', 'own or prototype', placement, {
    correct: placement === 'own' || placement === 'prototype',
  });

  if (!configOptions.includes(configKey)) {
    throw new TypeError(`${configKey} is not one of the Final Form Field configuration keys`);
  }

  const finisher = (target) => {
    configMap.get(target).set(configKey, key);
  };

  if (kind === 'method' && value) {
    return {
      descriptor,
      extras: [
        method({
          key,
          value,
        }, {isBound: true}),
      ],
      finisher,
      key,
      kind,
      placement,
    };
  }

  return accessor({
    finisher,
    get,
    initializer,
    key,
    set,
  }, {
    adjust({get: originalGet, set: originalSet}) {
      return {
        get: originalGet,
        set: configKey === 'name' || configKey === 'subscription' ? function (v) {
          const oldValue = originalGet.call(this);
          originalSet.call(this, v);

          if (
            configKey === 'name'
              ? v !== oldValue
              : !shallowEqual(v, oldValue)
          ) {
            this[subscribe.get(this.constructor)]();
          }
        } : function (v) {
          if (v !== originalGet.call(this)) {
            this[update.get(this.constructor)]();
          }

          originalSet.call(this, v);
        },
      };
    },
  });
};

const field = (classDescriptor) => {
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

  const [
    superConnectedCallback,
    superDisconnectedCallback,
  ] = getSuperMethods(elements, lifecycleKeys);

  const {
    initializer: schedulerMethod = () => scheduler,
  } = elements.find(({key}) => key === $scheduler) || {};

  return {
    elements: [
      ...elements.filter(({key}) => !lifecycleKeys.includes(key)),

      // Public
      method({
        key: connectedCallbackKey,
        value() {
          superConnectedCallback.call(this);
          this[$$subscribe]();
        },
      }),
      method({
        key: disconnectedCallbackKey,
        value() {
          this[$$unsubscribe]();
          superDisconnectedCallback.call(this);
        },
      }),

      // Protected
      ffield({
        initializer: schedulerMethod,
        key: $scheduler,
      }, {isReadonly: true, isStatic: true}),
      accessor({
        get() {
          return this[$$form];
        },
        key: $formApi,
      }),

      // Private
      ffield({
        initializer: () => true,
        key: $$subscribingValid,
      }),
      ffield({
        initializer: () => noop,
        key: $$unsubscribe,
      }),
      ffield({
        initializer: () => true,
        key: $$updatingValid,
      }),
      method({
        key: $$onBlur,
        value() {
          const map = configMap.get(this.constructor);

          const {
            [map.get('format')]: format,
            [map.get('formatOnBlur')]: formatOnBlur,
          } = this;

          const {
            blur,
            change,
            name,
            value,
          } = this[$$formState];

          blur();

          if (format && formatOnBlur) {
            change(format(value, name));
          }
        },
      }, {isBound: true, isPrivate: true}),
      method({
        key: $$onChange,
        value(value) {
          const map = configMap.get(this.constructor);
          const parse = this[map.get('parse')];

          const {
            change,
            name,
          } = this[$$formState];

          change(
            parse
              ? parse(value, name)
              : value,
          );
        },
      }, {isBound: true, isPrivate: true}),
      method({
        key: $$onFocus,
        value() {
          this[$$formState].focus();
        },
      }, {isBound: true, isPrivate: true}),
      method({
        key: $$subscribe,
        value() {
          if (!this[$$subscribingValid]) {
            return;
          }

          this[$$subscribingValid] = false;

          this.constructor[$scheduler](() => {
            this[$$unsubscribe]();

            const map = configMap.get(this.constructor);

            const {
              [map.get('isEqual')]: isEqual,
              [map.get('name')]: name,
              [map.get('subscription')]: subscription,
              [map.get('validateFields')]: validateFields,
            } = this;

            const listener = (state) => {
              this[$$formState] = state;
              this[$$update]();
            };

            this[$$unsubscribe] = this[$$form].registerField(
              name,
              listener,
              subscription || all,
              {
                getValidator: () => this[map.get('validate')],
                isEqual,
                validateFields,
              },
            );

            this[$$subscribingValid] = true;
          });
        },
      }, {isPrivate: true}),
      method({
        key: $$update,
        value() {
          if (!this[$$updatingValid]) {
            return;
          }

          this[$$updatingValid] = false;

          this.constructor[$scheduler](() => {
            const map = configMap.get(this.constructor);

            const {
              [map.get('format')]: format,
              [map.get('formatOnBlur')]: formatOnBlur,
              [map.get('name')]: name,
            } = this;

            const {
              blur: _b,
              change: _c,
              focus: _f,
              name: _n,
              value,
              ...meta
            } = this[$$formState];

            this[$input] = {
              name,
              onBlur: this[$$onBlur],
              onChange: this[$$onChange],
              onFocus: this[$$onFocus],
              value: !formatOnBlur && format
                ? format(value, name)
                : value,
            };

            this[$meta] = meta;
            this[$$updatingValid] = true;
          });
        },
      }, {isPrivate: true}),
    ],
    finisher(target) {
      configMap.set(target, new Map());
      subscribe.set(target, $$subscribe);
      update.set(target, $$update);
    },
    kind,
  };
};

export default field;
