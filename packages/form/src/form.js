import {assertKind} from '@corpuscule/utils/lib/asserts';
import {accessor, field, method} from '@corpuscule/utils/lib/descriptors';
import getSuperMethods from '@corpuscule/utils/lib/getSuperMethods';
import shallowEqual from '@corpuscule/utils/lib/shallowEqual';
import {createForm} from 'final-form';
import {
  provider,
  providingValue as $formApi,
} from './context';
import {
  debug as $debug,
  destroyOnUnregister as $destroyOnUnregister, formState as $formState,
  initialValues as $initialValues, initialValuesEqual as $initialValuesEqual,
  keepDirtyOnReinitialize as $keepDirtyOnReinitialize,
  mutators as $mutators,
  onSubmit as $onSubmit,
  validateForm as $validate,
  validateOnBlur as $validateOnBlur,
} from './tokens/form';
import {submit as $$submit, unsubscriptions as $$unsubscriptions} from './tokens/internal';
import {all} from './utils';

const configOptions = new Map([
  [$debug, 'debug'],
  [$destroyOnUnregister, 'destroyOnUnregister'],
  [$initialValues, 'initialValues'],
  [$keepDirtyOnReinitialize, 'keepDirtyOnReinitialize'],
  [$mutators, 'mutators'],
  [$onSubmit, 'onSubmit'],
  [$validate, 'validate'],
  [$validateOnBlur, 'validateOnBlur'],
]);

const connectedCallbackKey = 'connectedCallback';
const disconnectedCallbackKey = 'disconnectedCallback';

const methods = [
  connectedCallbackKey,
  disconnectedCallbackKey,
];

const form = ({decorators, subscription = all}) => (classDescriptor) => {
  assertKind('form', 'class', classDescriptor.kind);

  const {elements, kind} = provider(classDescriptor);

  const [
    superConnectedCallback,
    superDisconnectedCallback,
  ] = getSuperMethods(elements, methods);

  const configElements = elements.filter(({key}) => configOptions.has(key));
  const configInitializers = configElements
    .map(({descorator: {value}, initializer, key, kind: optionKind}) => [
      configOptions.get(key),
      optionKind === 'field' ? initializer : () => value,
    ]);

  const configDescriptors = configElements.map(({key}) => accessor({
    get() {
      return this[$formApi][configOptions.get(key)];
    },
    key,
    ...key === $initialValues ? {
      set(initialValues) {
        if (!(this[$initialValuesEqual] || shallowEqual)(
          this[key],
          initialValues,
        )) {
          this[$formApi].initialize(initialValues);
        }
      },
    } : {
      set(optionValue) {
        if (this[key] !== optionValue) {
          this[$formApi].setConfig(
            configOptions.get(key),
            typeof optionValue === 'function' ? optionValue.bind(this) : optionValue,
          );
        }
      },
    },
  }));

  return {
    elements: [
      ...elements.filter(({key}) => !methods.includes(key) && !configOptions.has(key)),
      ...configDescriptors,

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

          this.removeEventListener('onSubmit', this[$$submit]);

          superDisconnectedCallback.call(this);
        },
      }),

      // Protected
      field({
        initializer() {
          return createForm(configInitializers.reduce((acc, [key, initializer]) => {
            acc[key] = initializer.call(this);

            return acc;
          }, {}));
        },
        key: $formApi,
      }, {isReadonly: true}),

      // Private
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
