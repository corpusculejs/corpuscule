import createContext from '@corpuscule/context';
import {assertKind} from '@corpuscule/utils/lib/asserts';
import {lifecycleKeys, method} from '@corpuscule/utils/lib/descriptors';
import getSuperMethods from '@corpuscule/utils/lib/getSuperMethods';
import {layout, resolve} from './tokens/lifecycle';

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

const methods = [
  ...lifecycleKeys,
  resolve,
];

const filteringNames = methods;

const [
  connectedCallbackKey,
  disconnectedCallbackKey,
] = lifecycleKeys;

const outlet = routes => (classDescriptor) => {
  assertKind('outlet', 'class', classDescriptor.kind);

  const {elements, kind} = consumer(classDescriptor);

  const $$updateRoute = Symbol();

  const [
    superConnectedCallback,
    superDisconnectedCallback,
    superResolve,
  ] = getSuperMethods(elements, methods, {
    *[resolve](path) {
      return yield path;
    },
  });

  return {
    elements: [
      ...elements.filter(({key}) => !filteringNames.includes(key)),

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

      // Protected
      method({
        key: resolve,
        value: superResolve,
      }),

      // Private
      method({
        key: $$updateRoute,
        async value(pathOrEvent) {
          const path = typeof pathOrEvent === 'string'
            ? pathOrEvent
            : pathOrEvent.state || '';

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
      }, {isBound: true, isPrivate: true}),
    ],
    kind,
  };
};

export default outlet;
