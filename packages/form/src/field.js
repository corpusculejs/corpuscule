import {assertKind, assertPlacement} from '@corpuscule/utils/lib/asserts';
import createDualDescriptor from '@corpuscule/utils/lib/createDualDescriptor';
import {
  accessor,
  field as ffield,
  method,
  lifecycleKeys,
} from '@corpuscule/utils/lib/descriptors';
import getSuperMethods from '@corpuscule/utils/lib/getSuperMethods';
import scheduler from '@corpuscule/utils/lib/scheduler';
import shallowEqual from '@corpuscule/utils/lib/shallowEqual';
import {consumer, contextValue as $form} from './context';
import {
  input as $input,
  meta as $meta,
  scheduler as $scheduler,
} from './tokens/field/lifecycle';
import {
  configMap as $$configMap,
  formState as $$formState,
  listener as $$listener,
  onBlur as $$onBlur,
  onChange as $$onChange,
  onFocus as $$onFocus,
  subscribe as $$subscribe,
  subscribingValid as $$subscribingValid,
  unsubscribe as $$unsubscribe,
  update as $$update,
  updatingValid as $$updatingValid,
} from './tokens/field/internal';
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

export const fieldConfig = configKey => ({
  descriptor,
  initializer,
  key,
  kind,
  placement,
}) => {
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
    target[$$configMap].set(configKey, key);
  };

  if (kind === 'method' && descriptor.value) {
    return {
      descriptor,
      extras: [
        method({
          key,
          value: descriptor.value,
        }, {isBound: true}),
      ],
      finisher,
      key,
      kind,
      placement,
    };
  }

  const [
    {get, set},
    initializerDescriptor,
  ] = createDualDescriptor(descriptor, initializer, kind === 'method');

  return accessor({
    extras: initializerDescriptor ? [initializerDescriptor] : undefined,
    finisher,
    get,
    key,
    ...configKey === 'name' || configKey === 'subscription' ? {
      set(value) {
        const oldValue = get.call(this);
        set.call(this, value);

        if (
          configKey === 'name'
            ? value !== oldValue
            : !shallowEqual(value, oldValue)
        ) {
          this[$$subscribe]();
        }
      },
    } : {
      set(value) {
        if (value !== get.call(this)) {
          this[$$update]();
        }

        set.call(this, value);
      },
    },
  });
};

const field = (classDescriptor) => {
  assertKind('field', 'class', classDescriptor.kind);

  const {elements, kind} = consumer(classDescriptor);

  const [
    superConnectedCallback,
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
        },
      }),

      // Protected
      ffield({
        initializer: schedulerMethod,
        key: $scheduler,
      }, {isReadonly: true, isStatic: true}),

      // Private
      ffield({
        initializer: () => new Map(),
        key: $$configMap,
      }, {isPrivate: true, isStatic: true}),
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
        key: $$listener,
        value(state) {
          this[$$formState] = state;
          this[$$update]();
        },
      }, {isBound: true, isPrivate: true}),
      method({
        key: $$onBlur,
        value() {
          const {
            [$$configMap]: map,
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
          const parse = this[this[$$configMap].get('parse')];

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

            const {
              [$$configMap]: map,
              [map.get('isEqual')]: isEqual,
              [map.get('name')]: name,
              [map.get('subscription')]: subscription,
              [map.get('validateFields')]: validateFields,
            } = this;

            this[$$unsubscribe] = this[$form].registerField(
              name,
              this[$$listener],
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
            const {
              [$$configMap]: map,
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
    kind,
  };
};

export default field;
