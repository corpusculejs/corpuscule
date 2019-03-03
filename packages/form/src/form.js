import {assertKind, assertRequiredProperty, Kind} from '@corpuscule/utils/lib/asserts';
import {field, hook, lifecycleKeys, method} from '@corpuscule/utils/lib/descriptors';
import {method as lifecycleMethod} from '@corpuscule/utils/lib/lifecycleDescriptors';
import getSupers from '@corpuscule/utils/lib/getSupers';
import {getName, getValue, setValue} from '@corpuscule/utils/lib/propertyUtils';
import {createForm, formSubscriptionItems} from 'final-form';
import {filter, noop} from './utils';

const [connectedCallbackKey, disconnectedCallbackKey] = lifecycleKeys;

export const all = formSubscriptionItems.reduce((result, key) => {
  result[key] = true;

  return result;
}, {});

const createFormDecorator = ({provider}, {formApi, state}, {configOptions}) => ({
  decorators,
  subscription = all,
} = {}) => descriptor => {
  assertKind('form', Kind.Class, descriptor);

  const {elements, finisher = noop, kind} = descriptor;

  let $formApi;
  let constructor;
  let $state;
  let configs;

  const getConstructor = () => constructor;

  const $$reset = Symbol();
  const $$submit = Symbol();
  const $$unsubscriptions = Symbol();

  const [supers, prepareSupers] = getSupers(elements, lifecycleKeys);

  return provider({
    elements: [
      // Public
      ...lifecycleMethod(
        {
          key: connectedCallbackKey,
          method() {
            const instance = getValue(this, $formApi);

            if (decorators) {
              for (const decorate of decorators) {
                this[$$unsubscriptions].push(decorate(instance));
              }
            }

            this[$$unsubscriptions].push(
              instance.subscribe(newState => {
                setValue(this, $state, newState);
              }, subscription),
            );

            this.addEventListener('submit', this[$$submit]);
            this.addEventListener('reset', this[$$reset]);

            supers[connectedCallbackKey].call(this);
          },
        },
        supers,
        getConstructor,
      ),
      ...lifecycleMethod(
        {
          key: disconnectedCallbackKey,
          method() {
            for (const unsubscribe of this[$$unsubscriptions]) {
              unsubscribe();
            }

            this[$$unsubscriptions] = [];

            this.removeEventListener('submit', this[$$submit]);
            this.removeEventListener('reset', this[$$reset]);

            supers[disconnectedCallbackKey].call(this);
          },
        },
        supers,
        getConstructor,
      ),

      // Private
      field({
        initializer: () => [],
        key: $$unsubscriptions,
      }),
      method({
        bound: true,
        key: $$reset,
        method(e) {
          e.preventDefault();
          e.stopPropagation();

          getValue(this, $formApi).reset();
        },
      }),
      method({
        bound: true,
        key: $$submit,
        method(e) {
          e.preventDefault();
          e.stopPropagation();

          getValue(this, $formApi).submit();
        },
      }),

      // Static Hooks
      hook({
        start() {
          configOptions.set(this, []);
        },
      }),

      // Original elements
      ...filter(elements),

      // Own Hooks
      hook({
        placement: 'own',
        start() {
          setValue(
            this,
            $formApi,
            createForm(
              configs.reduce((acc, key) => {
                const configValue = this[key];
                acc[key] = typeof configValue === 'function' ? configValue.bind(this) : configValue;

                return acc;
              }, {}),
            ),
          );
        },
      }),
    ],
    finisher(target) {
      finisher(target);
      constructor = target;

      $formApi = formApi.get(target);
      $state = state.get(target);

      assertRequiredProperty('form', 'api', 'form', $formApi);
      assertRequiredProperty('form', 'api', 'state', $state);

      configs = configOptions.get(target);

      assertRequiredProperty(
        'form',
        'option',
        'onSubmit',
        configs.find(key => getName(key) === 'onSubmit'),
      );

      prepareSupers(target);
    },
    kind,
  });
};

export default createFormDecorator;
