import {provider} from '@corpuscule/context';
import {assertRequiredProperty} from '@corpuscule/utils/lib/asserts';
import defineExtendable from '@corpuscule/utils/lib/defineExtendable';
import reflectClassMethods from '@corpuscule/utils/lib/reflectClassMethods';
import {createForm, formSubscriptionItems} from 'final-form';
import {formOptionResponsibilityKeys, tokenRegistry} from './utils';

export const all = formSubscriptionItems.reduce((result, key) => {
  result[key] = true;

  return result;
}, {});

const form = (token, {decorators = [], subscription = all} = {}) => klass => {
  let $formApi;
  let $state;
  let $onSubmit;
  let sharedProperties;

  const {prototype} = klass;
  const sharedPropertiesRegistry = tokenRegistry.get(token);

  const $$reset = Symbol();
  const $$submit = Symbol();
  const $$unsubscriptions = Symbol();

  const supers = reflectClassMethods(prototype, ['connectedCallback', 'disconnectedCallback']);

  klass.__registrations.push(() => {
    sharedProperties = sharedPropertiesRegistry.get(klass) || {};
    ({formApi: $formApi, state: $state, onSubmit: $onSubmit} = sharedProperties);
    assertRequiredProperty('form', 'gear', 'form', $formApi);
    assertRequiredProperty('form', 'gear', 'state', $state);
    assertRequiredProperty('form', 'option', 'onSubmit', $onSubmit);
  });

  defineExtendable(
    klass,
    {
      connectedCallback() {
        const instance = this[$formApi];

        for (const decorate of decorators) {
          this[$$unsubscriptions].push(decorate(instance));
        }

        this[$$unsubscriptions].push(
          instance.subscribe(newState => {
            this[$state] = newState;
          }, subscription),
        );

        this.addEventListener('submit', this[$$submit]);
        this.addEventListener('reset', this[$$reset]);

        supers.connectedCallback.call(this);
      },
      disconnectedCallback() {
        for (const unsubscribe of this[$$unsubscriptions]) {
          unsubscribe();
        }

        this[$$unsubscriptions] = [];

        this.removeEventListener('submit', this[$$submit]);
        this.removeEventListener('reset', this[$$reset]);

        supers.disconnectedCallback.call(this);
      },
    },
    supers,
    klass.__initializers,
  );

  provider(token)(klass);

  klass.__initializers.push(self => {
    Object.assign(self, {
      // Fields
      [$formApi]: createForm(
        formOptionResponsibilityKeys.reduce((acc, key) => {
          if (sharedProperties[key]) {
            acc[key] = self[sharedProperties[key]];
          }

          return acc;
        }, {}),
      ),
      // eslint-disable-next-line sort-keys
      [$$unsubscriptions]: [],

      // Methods
      // eslint-disable-next-line sort-keys
      [$$reset](event) {
        event.preventDefault();
        event.stopPropagation();

        self[$formApi].reset();
      },
      [$$submit](event) {
        event.preventDefault();
        event.stopPropagation();

        self[$formApi].submit();
      },
    });
  });
};

export default form;
