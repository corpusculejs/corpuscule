import {provider as contextProvider, value} from '@corpuscule/context';
import {assertRequiredProperty} from '@corpuscule/utils/lib/asserts';
import defineExtendable from '@corpuscule/utils/lib/defineExtendable';
import reflectClassMethods from '@corpuscule/utils/lib/reflectClassMethods';
import {tokenRegistry} from './utils';

const provider = (token, {initial = location.pathname} = {}) => klass => {
  let $router;

  const {prototype} = klass;

  const $$providingValue = Symbol();
  const $$updateRoute = Symbol();

  klass.__registrations.push(() => {
    ({value: $router} = tokenRegistry.get(token).get(klass));
    assertRequiredProperty('provider', 'gear', $router);
  });

  const supers = reflectClassMethods(prototype, ['connectedCallback', 'disconnectedCallback']);
  const valueDescriptor = value(token)(prototype, $$providingValue);

  defineExtendable(
    klass,
    {
      connectedCallback() {
        window.addEventListener('popstate', this[$$updateRoute]);
        supers.connectedCallback.call(this);

        this[$$updateRoute]();
      },
      disconnectedCallback() {
        window.removeEventListener('popstate', this[$$updateRoute]);
        supers.disconnectedCallback.call(this);
      },
    },
    supers,
    klass.__initializers,
  );

  Object.defineProperty(prototype, $$providingValue, valueDescriptor);

  klass.__initializers.push(self => {
    self[$$updateRoute] = async ({state: pathname = initial} = {}) => {
      self[$$providingValue] = await self[$router].resolve({
        // This array goes to the resolveRoute function and fills with the
        // passed routes.
        chain: [],
        pathname,
      });
    };
  });

  contextProvider(token)(klass);
};

export default provider;
