import createContext from '@corpuscule/context';
import {assertKind} from '@corpuscule/utils/lib/asserts';
import {accessor, method} from '@corpuscule/utils/lib/descriptors';
import getSuperMethods from '@corpuscule/utils/lib/getSuperMethods';
import {
  context as $$context,
  subscribe as $$subscribe,
  unsubscribe as $$unsubscribe,
  update as $$update,
} from './tokens/internal';
import {connectedRegistry} from './decorators';

const {
  consumer,
  contextValue,
  provider,
  providingValue: store,
} = createContext();

export {
  provider,
  store,
};

export {
  connected,
  dispatcher,
} from './decorators';

const disconnectedCallbackKey = 'disconnectedCallback';

export const connect = (classDescriptor) => {
  assertKind('connect', 'class', classDescriptor.kind);

  const {elements, kind} = consumer(classDescriptor);
  const [superDisconnectedCallback] = getSuperMethods(elements, [disconnectedCallbackKey]);

  return {
    elements: [
      ...elements.filter(({key}) => key !== disconnectedCallbackKey),

      // Public
      method({
        key: disconnectedCallbackKey,
        value() {
          superDisconnectedCallback.call(this);

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
      }, {isPrivate: true}),
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
      }, {isPrivate: true}),
    ],
    kind,
  };
};
