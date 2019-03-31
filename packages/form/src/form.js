import {provider} from '@corpuscule/context';
import {assertRequiredProperty} from '@corpuscule/utils/lib/asserts';
import getSupers from '@corpuscule/utils/lib/getSupersNew';
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

  const [sharedPropertiesRegistry, formOptionsRegistry] = tokenRegistry.get(token);

  const $$connectedCallback = Symbol();
  const $$disconnectedCallback = Symbol();
  const $$reset = Symbol();
  const $$submit = Symbol();
  const $$unsubscriptions = Symbol();

  const supers = getSupers(target, ['connectedCallback', 'disconnectedCallback']);

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

  Object.assign(target.prototype, {
    connectedCallback() {
      this[$$connectedCallback]();
    },
    disconnectedCallback() {
      this[$$disconnectedCallback]();
    },
  });

  provider(token)(target);

  target.__initializers.push(self => {
    // Inheritance workaround. If class is inherited, method will work in a different way
    const isExtended = self.constructor !== target;

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
      [$$connectedCallback]: isExtended
        ? supers.connectedCallback
        : () => {
            const instance = self[$formApi];

            for (const decorate of decorators) {
              self[$$unsubscriptions].push(decorate(instance));
            }

            self[$$unsubscriptions].push(
              instance.subscribe(newState => {
                self[$state] = newState;
              }, subscription),
            );

            self.addEventListener('submit', self[$$submit]);
            self.addEventListener('reset', self[$$reset]);

            supers.connectedCallback.call(self);
          },
      [$$disconnectedCallback]: isExtended
        ? supers.disconnectedCallback
        : () => {
            for (const unsubscribe of self[$$unsubscriptions]) {
              unsubscribe();
            }

            self[$$unsubscriptions] = [];

            self.removeEventListener('submit', self[$$submit]);
            self.removeEventListener('reset', self[$$reset]);

            supers.disconnectedCallback.call(self);
          },
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
