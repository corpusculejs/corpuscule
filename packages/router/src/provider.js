import {provider as contextProvider, value} from '@corpuscule/context';
import {assertRequiredProperty} from '@corpuscule/utils/lib/asserts';
import defineExtendable from '@corpuscule/utils/lib/defineExtendable';
import reflectClassMethods from '@corpuscule/utils/lib/reflectClassMethods';
import {tokenRegistry} from './utils';

const provider = (token, {initial = location.pathname} = {}) => target => {
  let $router;

  const {prototype} = target;

  const $$providingValue = Symbol();
  const $$updateRoute = Symbol();

  target.__registrations.push(() => {
    ({value: $router} = tokenRegistry.get(token).get(target));
    assertRequiredProperty('provider', 'gear', $router);
  });

  const supers = reflectClassMethods(prototype, ['connectedCallback', 'disconnectedCallback']);
  const valueDescriptor = value(token)(prototype, $$providingValue);

  defineExtendable(
    target,
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
    target.__initializers,
  );

  Object.defineProperty(prototype, $$providingValue, valueDescriptor);

  target.__initializers.push(self => {
    self[$$updateRoute] = async ({state: pathname = initial} = {}) => {
      self[$$providingValue] = await self[$router].resolve({
        chain: [],
        pathname,
      });
    };
  });

  contextProvider(token)(target);
};

export default provider;
