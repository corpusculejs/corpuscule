import createContext from "@corpuscule/context";
import {
  context as $$context,
  subscribe as $$subscribe,
  unsubscribe as $$unsubscribe,
  update as $$update,
} from "./tokens/internal";
import {connectedRegistry} from "./decorators";
import getSuperMethod from "@corpuscule/utils/lib/getSuperMethod";

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
} from "./decorators";

const disconnectedCallbackKey = "disconnectedCallback";

export const connect = (classDescriptor) => {
  if (classDescriptor.kind !== "class") {
    throw new TypeError(`@connect can be applied only to class, not to ${classDescriptor.kind}`);
  }

  const {elements, kind} = consumer(classDescriptor);

  const superDisconnectedCallback = getSuperMethod(disconnectedCallbackKey, elements);

  return {
    elements: [...elements.filter(({key}) => key !== disconnectedCallbackKey), {
      descriptor: {
        configurable: true,
        enumerable: true,
        value() {
          superDisconnectedCallback(this);

          if (this[$$unsubscribe]) {
            this[$$unsubscribe]();
          }
        },
      },
      key: disconnectedCallbackKey,
      kind: "method",
      placement: "prototype",
    }, {
      descriptor: {
        set(value) {
          this[$$context] = value;

          if (this[$$unsubscribe]) {
            this[$$unsubscribe]();
          }

          this[$$subscribe]();
        },
      },
      key: contextValue,
      kind: "method",
      placement: "prototype",
    }, {
      descriptor: {
        value() {
          this[$$update](this[$$context]);

          this[$$unsubscribe] = this[$$context].subscribe(() => {
            this[$$update](this[$$context]);
          });
        },
      },
      key: $$subscribe,
      kind: "method",
      placement: "prototype",
    }, {
      descriptor: {
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
      },
      key: $$update,
      kind: "method",
      placement: "prototype",
    }],
    kind,
  };
};
