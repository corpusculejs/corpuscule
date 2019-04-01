import {consumer, value} from '@corpuscule/context';
import {assertRequiredProperty} from '@corpuscule/utils/lib/asserts';
import {resolve as $resolve} from './tokens/lifecycle';
import getSupers from '@corpuscule/utils/lib/getSupers';
import {tokenRegistry} from './utils';

const outlet = (token, routes) => target => {
  let $layout;
  let $route;

  const {prototype} = target;

  const $$connectedCallback = Symbol();
  const $$contextProperty = Symbol();
  const $$disconnectedCallback = Symbol();
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

  Object.assign(prototype, {
    connectedCallback() {
      this[$$connectedCallback]();
    },
    disconnectedCallback() {
      this[$$disconnectedCallback]();
    },
    // eslint-disable-next-line sort-keys
    [$resolve]: supers[$resolve],
  });

  Object.defineProperty(prototype, $$contextProperty, valueDescriptor);

  target.__initializers.push(self => {
    // Inheritance workaround. If class is inherited, method will work in a different way
    const isExtended = self.constructor !== target;

    Object.assign(self, {
      [$$connectedCallback]: isExtended
        ? supers.connectedCallback
        : () => {
            window.addEventListener('popstate', self[$$updateRoute]);
            supers.connectedCallback.call(self);

            self[$$updateRoute](location.pathname);
          },
      [$$disconnectedCallback]: isExtended
        ? supers.disconnectedCallback
        : () => {
            window.removeEventListener('popstate', self[$$updateRoute]);
            supers.disconnectedCallback.call(self);
          },
      async [$$updateRoute](pathOrEvent) {
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
      },
    });
  });

  consumer(token)(target);
};

export default outlet;
