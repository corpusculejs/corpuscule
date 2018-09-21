/* eslint-disable max-classes-per-file */
import {createBaseCallbackCaller} from "./utils";

const randomString = () => {
  const arr = new Uint32Array(2);
  const [rnd1, rnd2] = crypto.getRandomValues(arr);

  return `${rnd1}${rnd2}`;
};

const createContext = (defaultValue) => {
  const eventName = randomString();

  const $$consume = Symbol("consume");
  const $$consumers = Symbol("consumers");
  const $$subscribe = Symbol("subscribe");
  const $$unsubscribe = Symbol("unsubscribe");
  const $$value = Symbol("value");

  const providingValue = Symbol("providingValue");
  const contextValue = Symbol("contextValue");

  const provider = ({elements, kind}) => {
    if (kind !== "class") {
      throw new TypeError("@provider can be applied only to a class");
    }

    const providingValueMethod = elements.find(({key}) => key === providingValue);

    const callBaseConnectedCallback = createBaseCallbackCaller("connectedCallback", elements);
    const callBaseDisconnectedCallback = createBaseCallbackCaller("disconnectedCallback", elements);

    return {
      elements: [...elements.filter(({key}) =>
        key !== "connectedCallback"
        && key !== "disconnectedCallback"
        && key !== providingValue,
      ), {
        descriptor: {
          configurable: true,
          enumerable: true,
          value() {
            this.addEventListener(eventName, this[$$subscribe]);

            if (providingValueMethod && providingValueMethod.initializer) {
              this[providingValue] = providingValueMethod.initializer();
            }

            callBaseConnectedCallback(this);
          },
        },
        key: "connectedCallback",
        kind: "method",
        placement: "prototype",
      }, {
        descriptor: {
          configurable: true,
          enumerable: true,
          value() {
            this.removeEventListener(eventName, this[$$subscribe]);
            callBaseDisconnectedCallback(this);
          },
        },
        key: "disconnectedCallback",
        kind: "method",
        placement: "prototype",
      }, {
        descriptor: {
          configurable: true,
          enumerable: true,
          get() {
            return this[$$value];
          },
          set(v) {
            this[$$value] = v;

            for (const cb of this[$$consumers]) {
              cb(v);
            }
          },
        },
        key: providingValue,
        kind: "method",
        placement: "prototype",
      }, {
        descriptor: {
          writable: true,
        },
        initializer: () => [],
        key: $$consumers,
        kind: "field",
        placement: "own",
      }, {
        descriptor: {
          value(event) {
            const {consume} = event.detail;

            this[$$consumers].push(consume);
            consume(this[$$value]);

            event.detail.unsubscribe = this[$$unsubscribe];
            event.stopPropagation();
          },
        },
        key: $$subscribe,
        kind: "method",
        placement: "own",
      }, {
        descriptor: {},
        initializer() {
          return (consume) => {
            this[$$consumers] = this[$$consumers].filter(p => p !== consume);
          };
        },
        key: $$unsubscribe,
        kind: "field",
        placement: "own",
      }, {
        descriptor: {
          writable: true,
        },
        initializer: () => defaultValue,
        key: $$value,
        kind: "field",
        placement: "own",
      }],
      kind,
    };
  };

  const consumer = ({elements, kind}) => {
    if (kind !== "class") {
      throw new TypeError("@provider can be applied only to a class");
    }

    const callBaseConnectedCallback = createBaseCallbackCaller("connectedCallback", elements);
    const callBaseDisconnectedCallback = createBaseCallbackCaller("disconnectedCallback", elements);

    return {
      elements: [...elements.filter(({key}) =>
        key !== "connectedCallback"
        && key !== "disconnectedCallback"
        && key !== contextValue,
      ), {
        descriptor: {
          configurable: true,
          enumerable: true,
          value() {
            const event = new CustomEvent(eventName, {
              bubbles: true,
              cancelable: true,
              composed: true,
              detail: {consume: this[$$consume]},
            });

            this.dispatchEvent(event);

            this[$$unsubscribe] = event.detail.unsubscribe;

            if (!this[$$unsubscribe]) {
              throw new Error(`No provider found for ${this.constructor.name}`);
            }

            callBaseConnectedCallback(this);
          },
        },
        key: "connectedCallback",
        kind: "method",
        placement: "prototype",
      }, {
        descriptor: {
          configurable: true,
          enumerable: true,
          value() {
            if (this[$$unsubscribe]) {
              this[$$unsubscribe](this[$$consume]);
            }

            callBaseDisconnectedCallback(this);
          },
        },
        key: "disconnectedCallback",
        kind: "method",
        placement: "prototype",
      }, {
        descriptor: {},
        initializer() {
          return (v) => {
            this[contextValue] = v;
          };
        },
        key: $$consume,
        kind: "field",
        placement: "own",
      }],
      kind,
    };
  };

  return {
    consumer,
    contextValue,
    provider,
    providingValue,
  };
};

export default createContext;
