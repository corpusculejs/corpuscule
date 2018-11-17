import {assertKind, assertPlacement} from '@corpuscule/utils/lib/asserts';
import {accessor, field, lifecycleKeys, method} from '@corpuscule/utils/lib/descriptors';
import getSuperMethods from '@corpuscule/utils/lib/getSuperMethods';
import shallowEqual from '@corpuscule/utils/lib/shallowEqual';
import {configOptions, createForm} from 'final-form';
import {
  provider,
  providingValue as $formApi,
} from './context';
import {
  formState as $formState,
  initialValuesEqual as $initialValuesEqual,
} from './tokens/form/lifecycle';
import {
  configInitializers as $$configInitializers,
  submit as $$submit,
  unsubscriptions as $$unsubscriptions,
} from './tokens/form/internal';
import {all} from './utils';

const configMap = new Map(configOptions.map(key => [Symbol(key), key]));

const [
  connectedCallbackKey,
  disconnectedCallbackKey,
] = lifecycleKeys;

export const formConfig = configKey => ({
  descriptor,
  initializer,
  key,
  kind,
  placement,
}) => {
  assertKind('formConfig', 'not class', kind, {
    correct: kind !== 'class',
  });
  assertPlacement('formConfig', 'own or prototype', placement, {
    correct: placement === 'own' || placement === 'prototype',
  });

  if (!configOptions.includes(configKey)) {
    throw new TypeError(`${configKey} is not one of the Final Form configuration keys`);
  }

  if (kind === 'method' && descriptor.value) {
    return {
      descriptor,
      extras: [
        field({
          initializer() {
            this[$formApi].setConfig(configKey, descriptor.value.bind(this));
          },
          // TODO: replace with initializer when https://github.com/babel/babel/pull/9008 is merged
          key: Symbol(),
        }, {isPrivate: true}),
      ],
      key,
      kind,
      placement,
    };
  }

  const {get, set} = descriptor;

  const configSetter = configKey === 'initialValues' ? {
    set(initialValues) {
      if (!(this[$initialValuesEqual] || shallowEqual)(
        this[key],
        initialValues,
      )) {
        this[$formApi].initialize(initialValues);
      }
    },
  } : {
    set(value) {
      if (this[key] !== value) {
        this[$formApi].setConfig(configKey, value);
      }
    },
  };

  return accessor({
    finisher(target) {
      target[$$configInitializers].push(initializer);
    },
    ...get ? {get} : {
      get() {
        return this[$formApi].get(configKey);
      },
    },
    key,
    ...set ? {
      set(value) {
        configSetter.set.call(this, value);
        set.call(this, value);
      },
    } : configSetter,
  });
};

const form = ({decorators, subscription = all}) => (classDescriptor) => {
  assertKind('form', 'class', classDescriptor.kind);

  const {elements, kind} = provider(classDescriptor);

  const [
    superConnectedCallback,
    superDisconnectedCallback,
  ] = getSuperMethods(elements, lifecycleKeys);

  return {
    elements: [
      ...elements.filter(({key}) => !lifecycleKeys.includes(key) && !configMap.has(key)),

      // Public
      method({
        key: connectedCallbackKey,
        value() {
          if (decorators) {
            for (const decorate of decorators) {
              this[$$unsubscriptions].push(decorate(this[$formApi]));
            }
          }

          this[$$unsubscriptions].push(
            this[$formApi].subscribe((state) => {
              this[$formState] = state;
            }, subscription),
          );

          this.addEventListener('onSubmit', this[$$submit]);

          superConnectedCallback.call(this);
        },
      }),
      method({
        key: disconnectedCallbackKey,
        value() {
          for (const unsubscribe of this[$$unsubscriptions]) {
            unsubscribe();
          }

          this[$$unsubscriptions] = [];

          this.removeEventListener('onSubmit', this[$$submit]);
          superDisconnectedCallback.call(this);
        },
      }),

      // Protected
      field({
        initializer() {
          return createForm(this.constructor[$$configInitializers].reduce((
            acc,
            [key, initializer],
          ) => {
            acc[key] = initializer.call(this);

            return acc;
          }, {}));
        },
        key: $formApi,
      }, {isReadonly: true}),

      // Private
      field({
        initializer: () => [],
        key: $$configInitializers,
      }, {isPrivate: true, isStatic: true}),
      field({
        initializer: () => [],
        key: $$unsubscriptions,
      }, {isPrivate: true}),
      method({
        key: $$submit,
        value(e) {
          e.preventDefault();
          e.stopPropagation();

          this[$formApi].submit();
        },
      }, {isBound: true, isPrivate: true}),
    ],
    kind,
  };
};

export default form;
