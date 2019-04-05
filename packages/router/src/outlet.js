import {consumer, value} from '@corpuscule/context';
import {assertRequiredProperty} from '@corpuscule/utils/lib/asserts';
import defineExtendable from '@corpuscule/utils/lib/defineExtendable';
import {resolve as $resolve} from './tokens/lifecycle';
import getSupers from '@corpuscule/utils/lib/getSupers';
import {tokenRegistry} from './utils';

const outlet = (token, routes) => target => {
  let $layout;
  let $route;

  const {prototype} = target;

  const $$contextProperty = Symbol();
  const $$updateRoute = Symbol();

  const supers = getSupers(prototype, ['connectedCallback', 'disconnectedCallback', $resolve], {
    *[$resolve](path) {
      return yield path;
    },
  });

  const valueDescriptor = value(token)(prototype, $$contextProperty);

  target.__registrations.push(() => {
    ({layout: $layout, route: $route} = tokenRegistry.get(token).get(target));
    assertRequiredProperty('outlet', 'api', 'layout', $layout);
    assertRequiredProperty('outlet', 'api', 'route', $route);
  });

  defineExtendable(
    target,
    {
      connectedCallback() {
        window.addEventListener('popstate', this[$$updateRoute]);
        supers.connectedCallback.call(this);

        this[$$updateRoute](location.pathname);
      },
      disconnectedCallback() {
        window.removeEventListener('popstate', this[$$updateRoute]);
        supers.disconnectedCallback.call(this);
      },
    },
    supers,
    target.__initializers,
  );

  prototype[$resolve] = supers[$resolve];

  Object.defineProperty(prototype, $$contextProperty, valueDescriptor);

  target.__initializers.push(self => {
    self[$$updateRoute] = async pathOrEvent => {
      const path = typeof pathOrEvent === 'string' ? pathOrEvent : pathOrEvent.state || '';

      const iter = self[$resolve](path);

      const resolved = await self[$$contextProperty].resolve(iter.next().value);

      if (resolved === undefined) {
        return;
      }

      const [result, {route: currentRoute}] = resolved;

      if (routes.includes(currentRoute)) {
        self[$route] = currentRoute;
        self[$layout] = iter.next(result).value;
      }
    };
  });

  consumer(token)(target);
};

export default outlet;
