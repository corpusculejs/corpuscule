import createContext from '@corpuscule/context';
import {assertKind} from '@corpuscule/utils/lib/asserts';
import {lifecycleKeys, method} from '@corpuscule/utils/lib/descriptors';
import {layout, resolve} from './tokens/lifecycle';
import getSupers from '@corpuscule/utils/lib/getSupers';

const {consumer, contextValue, provider, providingValue: router} = createContext();

export {provider, router};

const methods = [...lifecycleKeys, resolve];

const filteringNames = methods;

const [connectedCallbackKey, disconnectedCallbackKey] = lifecycleKeys;

const outlet = routes => classDescriptor => {
  assertKind('outlet', 'class', classDescriptor.kind);

  const {elements, kind} = consumer(classDescriptor);

  const $$updateRoute = Symbol();

  const [supers, finish] = getSupers(elements, methods);

  return {
    elements: [
      ...elements.filter(({key}) => !filteringNames.includes(key)),

      // Public
      method({
        key: connectedCallbackKey,
        method() {
          window.addEventListener('popstate', this[$$updateRoute]);
          supers[connectedCallbackKey].call(this);

          this[$$updateRoute](location.pathname);
        },
        placement: 'own',
      }),
      method({
        key: disconnectedCallbackKey,
        method() {
          window.removeEventListener('popstate', this[$$updateRoute]);
          supers[disconnectedCallbackKey].call(this);
        },
        placement: 'own',
      }),

      // Protected
      method({
        key: resolve,
        method(...args) {
          return supers[resolve].apply(this, args);
        },
      }),

      // Private
      method({
        bound: true,
        key: $$updateRoute,
        async method(pathOrEvent) {
          const path = typeof pathOrEvent === 'string' ? pathOrEvent : pathOrEvent.state || '';

          const iter = this[resolve](path);

          const resolved = await this[contextValue].resolve(iter.next().value);

          if (resolved === undefined) {
            return;
          }

          const [result, {route}] = resolved;

          if (routes.includes(route)) {
            this[layout] = iter.next(result).value;
          }
        },
      }),
    ],
    finisher(target) {
      finish(target, {
        *[resolve](path) {
          return yield path;
        },
      });
    },
    kind,
  };
};

export default outlet;
