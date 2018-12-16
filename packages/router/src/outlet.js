import createContext from '@corpuscule/context';
import {assertKind} from '@corpuscule/utils/lib/asserts';
import createSupers from '@corpuscule/utils/lib/createSupers';
import {lifecycleKeys, method} from '@corpuscule/utils/lib/descriptors';
import {layout, resolve} from './tokens/lifecycle';

const {consumer, contextValue, provider, providingValue: router} = createContext();

export {provider, router};

const methods = [...lifecycleKeys, resolve];

const filteringNames = methods;

const [connectedCallbackKey, disconnectedCallbackKey] = lifecycleKeys;

const outlet = routes => classDescriptor => {
  assertKind('outlet', 'class', classDescriptor.kind);

  const {elements, kind} = consumer(classDescriptor);

  const $$updateRoute = Symbol();

  const $$superConnectedCallback = Symbol();
  const $$superDisconnectedCallback = Symbol();

  const supers = createSupers(
    elements,
    new Map([
      [connectedCallbackKey, $$superConnectedCallback],
      [disconnectedCallbackKey, $$superDisconnectedCallback],
      [
        resolve,
        {
          *fallback(path) {
            return yield path;
          },
          key: resolve,
        },
      ],
    ]),
  );

  return {
    elements: [
      ...elements.filter(({key}) => !filteringNames.includes(key)),
      ...supers,

      // Public
      method(
        {
          key: connectedCallbackKey,
          value() {
            window.addEventListener('popstate', this[$$updateRoute]);
            this[$$superConnectedCallback]();

            this[$$updateRoute](location.pathname);
          },
        },
        {isBound: true},
      ),
      method(
        {
          key: disconnectedCallbackKey,
          value() {
            window.removeEventListener('popstate', this[$$updateRoute]);
            this[$$superDisconnectedCallback]();
          },
        },
        {isBound: true},
      ),

      // Private
      method(
        {
          key: $$updateRoute,
          async value(pathOrEvent) {
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
        },
        {isBound: true},
      ),
    ],
    kind,
  };
};

export default outlet;
