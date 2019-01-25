import createContext from '@corpuscule/context';
import {assertKind} from '@corpuscule/utils/lib/asserts';
import getSupers from '@corpuscule/utils/lib/getSupers';
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

  const [supers, finish] = getSupers(elements, [disconnectedCallbackKey]);

  return {
    elements: [
      ...elements,

      // Public
      method({
        key: disconnectedCallbackKey,
        method() {
          supers[disconnectedCallbackKey].call(this);

          if (this[$$unsubscribe]) {
            this[$$unsubscribe]();
          }
        },
        placement: 'own',
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
        method() {
          this[$$update](this[$$context]);

          this[$$unsubscribe] = this[$$context].subscribe(() => {
            this[$$update](this[$$context]);
          });
        },
      }),
      method({
        key: $$update,
        method({getState}) {
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
      finish(target);
    },
    kind,
  };
};
