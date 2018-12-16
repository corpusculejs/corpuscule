import createContext from '@corpuscule/context';
import {assertKind} from '@corpuscule/utils/lib/asserts';
import createSupers from '@corpuscule/utils/lib/createSupers';
import {accessor, method} from '@corpuscule/utils/lib/descriptors';
import {connectedRegistry} from './decorators';
import {contextMap} from './utils';

const {consumer, contextValue, provider, providingValue: store} = createContext();

export {provider, store};

export {connected, dispatcher} from './decorators';

const disconnectedCallbackKey = 'disconnectedCallback';

export const connect = classDescriptor => {
  assertKind('connect', 'class', classDescriptor.kind);

  const {elements, kind} = consumer(classDescriptor);

  const $$context = Symbol();
  const $$subscribe = Symbol();
  const $$unsubscribe = Symbol();
  const $$update = Symbol();

  const $$superDisconnectedCallback = Symbol();

  const supers = createSupers(
    elements,
    new Map([[disconnectedCallbackKey, $$superDisconnectedCallback]]),
  );

  return {
    elements: [
      ...elements.filter(({key}) => key !== disconnectedCallbackKey),
      ...supers,

      // Public
      method({
        key: disconnectedCallbackKey,
        value() {
          this[$$superDisconnectedCallback]();

          if (this[$$unsubscribe]) {
            this[$$unsubscribe]();
          }
        },
      }),

      // Protected
      accessor({
        key: contextValue,
        set(value) {
          this[$$context] = value;

          if (this[$$unsubscribe]) {
            this[$$unsubscribe]();
          }

          this[$$subscribe]();
        },
      }),

      // Private
      method({
        key: $$subscribe,
        value() {
          this[$$update](this[$$context]);

          this[$$unsubscribe] = this[$$context].subscribe(() => {
            this[$$update](this[$$context]);
          });
        },
      }),
      method({
        key: $$update,
        value({getState}) {
          const registry = connectedRegistry.get(this.constructor);

          if (!registry) {
            return;
          }

          for (const [key, getter] of registry) {
            const nextValue = getter(getState());

            if (nextValue !== this[key]) {
              this[key] = nextValue;
            }
          }
        },
      }),
    ],
    finisher(target) {
      contextMap.set(target, $$context);
    },
    kind,
  };
};
