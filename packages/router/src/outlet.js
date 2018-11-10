import createContext from '@corpuscule/context';
import {assertKind} from '@corpuscule/utils/lib/asserts';
import getSuperMethod from '@corpuscule/utils/lib/getSuperMethod';
import {
  resolving as $$resolving,
  updateRoute as $$updateRoute,
} from './tokens/internal';
import {layout, resolve} from './tokens/lifecycle';
import {accessor, method} from '@corpuscule/utils/lib/descriptors';

const {
  consumer,
  contextValue,
  provider,
  providingValue: router,
} = createContext();

export {
  provider,
  router,
};

const connectedCallbackKey = 'connectedCallback';
const disconnectedCallbackKey = 'disconnectedCallback';

const outlet = routes => (classDescriptor) => {
  assertKind('outlet', 'class', classDescriptor.kind);

  const {elements, kind} = consumer(classDescriptor);

  const superConnectedCallback = getSuperMethod(connectedCallbackKey, elements);
  const superDisconnectedCallback = getSuperMethod(disconnectedCallbackKey, elements);

  return {
    elements: [
      ...elements.filter(({key}) =>
        key !== connectedCallbackKey
        && key !== disconnectedCallbackKey,
      ),

      // Public
      method({
        key: connectedCallbackKey,
        value() {
          window.addEventListener('popstate', this[$$updateRoute]);

          superConnectedCallback.call(this);

          this[$$updateRoute](location.pathname);
        },
      }),
      method({
        key: disconnectedCallbackKey,
        value() {
          window.removeEventListener('popstate', this[$$updateRoute]);
          superDisconnectedCallback.call(this);
        },
      }),
      accessor({
        get() {
          return this[$$resolving];
        },
        key: 'routeResolving',
      }),

      // Protected
      method({
        key: resolve,
        *value(path) {
          return yield path;
        },
      }),

      // Private
      method({
        key: $$updateRoute,
        value(pathOrEvent) {
          const path = typeof pathOrEvent === 'string'
            ? pathOrEvent
            : pathOrEvent.state || '';

          const iter = this[resolve](path);

          this[$$resolving] = this[contextValue].resolve(iter.next().value)
            .then((resolved) => {
              if (resolved === undefined) {
                return;
              }

              const [result, {route}] = resolved;

              if (routes.includes(route)) {
                this[layout] = iter.next(result).value;
              }
            });
        },
      }, {isBound: true, isPrivate: true}),
    ],
    kind,
  };
};

export default outlet;
