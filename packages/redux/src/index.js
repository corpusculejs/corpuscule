import createContext from "@corpuscule/context";
import {
  context as $$context,
  subscribe as $$subscribe,
  unsubscribe as $$unsubscribe,
  update as $$update,
} from "./tokens/internal";
import {connectedRegistry} from "./utils";

const {
  consumer,
  contextValue: context,
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
} from "./utils";

export const connect = (target) => {
  const consumed = consumer(target);

  const {
    disconnectedCallback,
  } = consumed;

  Object.defineProperties(consumed.prototype, {
    disconnectedCallback: {
      configurable: true,
      value() {
        if (disconnectedCallback) {
          disconnectedCallback.call(this);
        }

        if (this[$$unsubscribe]) {
          this[$$unsubscribe]();
        }
      },
    },
    // eslint-disable-next-line sort-keys, accessor-pairs
    [context]: {
      set(v) {
        this[$$context] = v;

        if (this[$$unsubscribe]) {
          this[$$unsubscribe]();
        }

        this[$$subscribe]();
      },
    },
    // eslint-disable-next-line sort-keys
    [$$subscribe]: {
      value() {
        this[$$update](this[$$context]);

        this[$$unsubscribe] = this[$$context].subscribe(() => {
          this[$$update](this[$$context]);
        });
      },
    },
    [$$update]: {
      value({getState}) {
        const registry = connectedRegistry.get(this.constructor.prototype);

        if (!registry) {
          return;
        }

        for (const [propertyName, getter] of registry) {
          const nextValue = getter(getState());

          if (nextValue !== this[propertyName]) {
            this[propertyName] = nextValue;
          }
        }
      },
    },
  });

  return consumed;
};
