import {assertKind, assertPlacement} from '@corpuscule/utils/lib/asserts';
import {accessor, field, lifecycleKeys, method} from '@corpuscule/utils/lib/descriptors';
import shallowEqual from '@corpuscule/utils/lib/shallowEqual';
import {configOptions, createForm} from 'final-form';
import {
  formState as $formState,
  compareInitialValues as $compareInitialValues,
} from './tokens/lifecycle';
import {all} from './utils';
import getSupers from '@corpuscule/utils/lib/getSupers';

const configInitializers = new WeakMap();
const formApiPropertyName = new WeakMap();

const [connectedCallbackKey, disconnectedCallbackKey] = lifecycleKeys;

export const formOption = configKey => ({descriptor, initializer, key, kind, placement}) => {
  const {get, set, value} = descriptor;

  assertKind('formOption', 'properties, methods or full accessors', kind, {
    correct: kind === 'field' || (kind === 'method' && (value || (get && set))),
  });
  assertPlacement('formOption', 'own or prototype', placement, {
    correct: placement === 'own' || placement === 'prototype',
  });

  if (!configOptions.includes(configKey)) {
    throw new TypeError(`"${configKey}" is not one of the Final Form configuration keys`);
  }

  if (kind === 'method' && value) {
    return {
      descriptor,
      finisher(target) {
        configInitializers.get(target).push([
          key,
          function() {
            return value.bind(this);
          },
        ]);
      },
      key,
      kind,
      placement,
    };
  }

  const updateForm =
    configKey === 'initialValues'
      ? function(initialValues) {
          if (!(this[$compareInitialValues] || shallowEqual)(this[key], initialValues)) {
            this[formApiPropertyName.get(this.constructor)].initialize(initialValues);
          }
        }
      : function(v) {
          if (this[key] !== v) {
            this[formApiPropertyName.get(this.constructor)].setConfig(configKey, v);
          }
        };

  return accessor(
    {
      finisher(target) {
        configInitializers.get(target).push([
          key,
          get
            ? function() {
                return get.call(this);
              }
            : initializer,
        ]);
      },
      get,
      initializer,
      key,
      set,
    },
    {
      adjust({get: originGet, set: originSet}) {
        return {
          get: originGet,
          set(v) {
            updateForm.call(this, v);
            originSet.call(this, v);
          },
        };
      },
    },
  );
};

const createFormDecorator = (provider, $formApi) => ({
  decorators,
  subscription = all,
} = {}) => classDescriptor => {
  assertKind('form', 'class', classDescriptor.kind);

  const $$submit = Symbol();
  const $$unsubscriptions = Symbol();

  const {elements, kind} = provider(classDescriptor);

  const [supers, finish] = getSupers(elements, [connectedCallbackKey, disconnectedCallbackKey]);

  return {
    elements: [
      ...elements.filter(({key}) => !lifecycleKeys.includes(key) && key !== $formState),

      // Public
      method(
        {
          key: connectedCallbackKey,
          value() {
            if (decorators) {
              for (const decorate of decorators) {
                this[$$unsubscriptions].push(decorate(this[$formApi]));
              }
            }

            this[$$unsubscriptions].push(
              this[$formApi].subscribe(state => {
                this[$formState] = state;
              }, subscription),
            );

            this.addEventListener('submit', this[$$submit]);

            supers[connectedCallbackKey].call(this);
          },
        },
        {isBound: true},
      ),
      method(
        {
          key: disconnectedCallbackKey,
          value() {
            for (const unsubscribe of this[$$unsubscriptions]) {
              unsubscribe();
            }

            this[$$unsubscriptions] = [];

            this.removeEventListener('submit', this[$$submit]);

            supers[disconnectedCallbackKey].call(this);
          },
        },
        {isBound: true},
      ),

      // Protected
      field({
        initializer() {
          this[$formApi] = createForm(
            configInitializers.get(this.constructor).reduce((acc, [key, initializer]) => {
              acc[key] = initializer ? initializer.call(this) : undefined;

              return acc;
            }, {}),
          );
        },
      }),

      // Private
      field(
        {
          initializer() {
            configInitializers.set(this, []);
          },
        },
        {isStatic: true},
      ),
      field({
        initializer: () => [],
        key: $$unsubscriptions,
      }),
      method(
        {
          key: $$submit,
          value(e) {
            e.preventDefault();
            e.stopPropagation();

            this[$formApi].submit();
          },
        },
        {isBound: true},
      ),
    ],
    finisher(target) {
      formApiPropertyName.set(target, $formApi);
      finish(target);
    },
    kind,
  };
};

export default createFormDecorator;
