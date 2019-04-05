import {provider} from '@corpuscule/context';
import {assertRequiredProperty} from '@corpuscule/utils/lib/asserts';
import defineExtendable from '@corpuscule/utils/lib/defineExtendable';
import getSupers from '@corpuscule/utils/lib/getSupers';
import {getName} from '@corpuscule/utils/lib/propertyUtils';
import {createForm, formSubscriptionItems} from 'final-form';
import {tokenRegistry} from './utils';

export const all = formSubscriptionItems.reduce((result, key) => {
  result[key] = true;

  return result;
}, {});

const form = (token, {decorators = [], subscription = all} = {}) => target => {
  let $formApi;
  let $state;
  let formOptions;

  const {prototype} = target;
  const [sharedPropertiesRegistry, formOptionsRegistry] = tokenRegistry.get(token);

  const $$reset = Symbol();
  const $$submit = Symbol();
  const $$unsubscriptions = Symbol();

  const supers = getSupers(prototype, ['connectedCallback', 'disconnectedCallback']);

  target.__registrations.push(() => {
    ({formApi: $formApi, state: $state} = sharedPropertiesRegistry.get(target) || {});
    formOptions = formOptionsRegistry.get(target) || [];
    assertRequiredProperty('form', 'api', 'form', $formApi);
    assertRequiredProperty('form', 'api', 'state', $state);
    assertRequiredProperty(
      'form',
      'option',
      'onSubmit',
      formOptions.find(key => getName(key) === 'onSubmit'),
    );
  });

  defineExtendable(
    target,
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
    target.__initializers,
  );

  provider(token)(target);

  target.__initializers.push(self => {
    Object.assign(self, {
      // Fields
      [$formApi]: createForm(
        formOptions.reduce((acc, key) => {
          acc[key] = self[key];

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
