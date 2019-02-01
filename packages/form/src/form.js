import {assertKind, assertRequiredProperty, Kind} from '@corpuscule/utils/lib/asserts';
import * as $ from '@corpuscule/utils/lib/descriptors';
import getSupers from '@corpuscule/utils/lib/getSupers';
import {getName, getValue, setValue} from '@corpuscule/utils/lib/propertyUtils';
import {createForm} from 'final-form';
import {all} from './utils';

const [connectedCallbackKey, disconnectedCallbackKey] = $.lifecycleKeys;

const createFormDecorator = ({provider}, {api}, {configInitializers, state}) => ({
  decorators,
  subscription = all,
} = {}) => descriptor => {
  assertKind('form', Kind.Class, descriptor);

  let $api;
  let $state;
  let initializers;

  const $$submit = Symbol();
  const $$unsubscriptions = Symbol();

  const {elements, kind} = provider(descriptor);

  const [supers, finish] = getSupers(elements, $.lifecycleKeys);

  return {
    elements: [
      ...elements,

      // Public
      $.method({
        bound: true,
        key: connectedCallbackKey,
        method() {
          const instance = getValue(this, $api);

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

          supers[connectedCallbackKey].call(this);
        },
        placement: 'own',
      }),
      $.method({
        key: disconnectedCallbackKey,
        method() {
          for (const unsubscribe of this[$$unsubscriptions]) {
            unsubscribe();
          }

          this[$$unsubscriptions] = [];

          this.removeEventListener('submit', this[$$submit]);

          supers[disconnectedCallbackKey].call(this);
        },
        placement: 'own',
      }),

      // Private
      $.field({
        initializer: () => [],
        key: $$unsubscriptions,
      }),
      $.method({
        bound: true,
        key: $$submit,
        method(e) {
          e.preventDefault();
          e.stopPropagation();

          getValue(this, $api).submit();
        },
      }),

      // Hooks
      $.hook({
        placement: 'own',
        start() {
          setValue(
            this,
            $api,
            createForm(
              initializers.reduce((acc, [key, initializer]) => {
                acc[key] = initializer ? initializer.call(this) : undefined;

                return acc;
              }, {}),
            ),
          );
        },
      }),
      $.hook({
        start() {
          configInitializers.set(this, []);
        },
      }),
    ],
    finisher(target) {
      finish(target);

      $api = api.get(target);
      $state = state.get(target);

      assertRequiredProperty('form', 'api', 'form', $api);
      assertRequiredProperty('form', 'api', 'state', $state);

      initializers = configInitializers.get(target);

      assertRequiredProperty(
        'form',
        'option',
        'onSubmit',
        initializers.find(([key]) => getName(key) === 'onSubmit'),
      );
    },
    kind,
  };
};

export default createFormDecorator;
