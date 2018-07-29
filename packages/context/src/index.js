/* eslint-disable max-classes-per-file */

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

  const provider = (target) => {
    const {
      connectedCallback,
      disconnectedCallback,
    } = target.prototype;

    Object.defineProperties(target.prototype, {
      connectedCallback: {
        configurable: true,
        value() {
          this.addEventListener(eventName, this[$$subscribe]);

          if (connectedCallback) {
            connectedCallback.call(this);
          }
        },
      },
      disconnectedCallback: {
        configurable: true,
        value() {
          this.removeEventListener(eventName, this[$$subscribe]);

          if (disconnectedCallback) {
            disconnectedCallback.call(this);
          }
        },
      },
      [providingValue]: {
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
      // eslint-disable-next-line sort-keys
      [$$consumers]: {
        value: [],
        writable: true,
      },
      [$$subscribe]: {
        configurable: true,
        get() {
          const subscribe = (event) => {
            const {consume} = event.detail;

            this[$$consumers].push(consume);
            consume(this[$$value]);

            event.detail.unsubscribe = this[$$unsubscribe];
            event.stopPropagation();
          };

          Object.defineProperty(this, $$subscribe, {
            value: subscribe,
          });

          return subscribe;
        },
      },
      [$$unsubscribe]: {
        configurable: true,
        get() {
          const unsubscribe = (consume) => {
            this[$$consumers] = this[$$consumers].filter(p => p !== consume);
          };

          Object.defineProperty(this, $$unsubscribe, {
            value: unsubscribe,
          });

          return unsubscribe;
        },
      },
      [$$value]: {
        value: defaultValue,
        writable: true,
      },
    });

    return target;
  };

  const consumer = (target) => {
    const {
      connectedCallback,
      disconnectedCallback,
    } = target.prototype;

    Object.defineProperties(target.prototype, {
      connectedCallback: {
        configurable: true,
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

          if (connectedCallback) {
            connectedCallback.call(this);
          }
        },
      },
      disconnectedCallback: {
        configurable: true,
        value() {
          if (this[$$unsubscribe]) {
            this[$$unsubscribe](this[$$consume]);
          }

          if (disconnectedCallback) {
            disconnectedCallback.call(this);
          }
        },
      },
      // eslint-disable-next-line sort-keys
      [$$consume]: {
        configurable: true,
        get() {
          const consume = (v) => {
            this[contextValue] = v;
          };

          Object.defineProperty(this, $$consume, {
            value: consume,
          });

          return consume;
        },
      },
    });

    return target;
  };

  return {
    consumer,
    contextValue,
    provider,
    providingValue,
  };
};

export default createContext;
