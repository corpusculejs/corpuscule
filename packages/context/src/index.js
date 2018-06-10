/* eslint-disable max-classes-per-file */

const randomString = () => {
  const arr = new Uint32Array(2);
  const [rnd1, rnd2] = crypto.getRandomValues(arr);

  return `${rnd1}${rnd2}`;
};

const createContext = (defaultValue) => {
  const eventName = randomString();

  const $$ = {
    consume: Symbol("consume"),
    consumers: Symbol("consumers"),
    subscribe: Symbol("subscribe"),
    unsubscribe: Symbol("unsubscribe"),
    value: Symbol("value"),
  };

  const providingValue = Symbol("providingValue");
  const contextValue = Symbol("contextValue");

  const provider = target =>
    class Provider extends target {
      constructor() {
        super();
        this[$$.consumers] = [];
        this[$$.value] = this[$$.value] !== undefined
          ? this[$$.value]
          : defaultValue;

        this[$$.subscribe] = this[$$.subscribe].bind(this);
        this[$$.unsubscribe] = this[$$.unsubscribe].bind(this);
      }

      get [providingValue]() {
        return this[$$.value];
      }

      set [providingValue](v) {
        this[$$.value] = v;

        if (this[$$.consumers]) {
          for (const cb of this[$$.consumers]) {
            cb(v);
          }
        }
      }

      connectedCallback() {
        this.addEventListener(eventName, this[$$.subscribe]);

        if (super.connectedCallback) {
          super.connectedCallback();
        }
      }

      disconnectedCallback() {
        this.removeEventListener(eventName, this[$$.subscribe]);

        if (super.disconnectedCallback) {
          super.disconnectedCallback();
        }
      }

      [$$.subscribe](event) {
        const {consume} = event.detail;

        this[$$.consumers].push(consume);
        consume(this[$$.value]);

        event.detail.unsubscribe = this[$$.unsubscribe];
        event.stopPropagation();
      }

      [$$.unsubscribe](consume) {
        this[$$.consumers] = this[$$.consumers].filter(p => p !== consume);
      }
    };

  const consumer = target =>
    class Consumer extends target {
      constructor() {
        super();
        this[$$.consume] = this[$$.consume].bind(this);
      }

      connectedCallback() {
        const event = new CustomEvent(eventName, {
          bubbles: true,
          cancelable: true,
          composed: true,
          detail: {consume: this[$$.consume]},
        });

        this.dispatchEvent(event);

        this[$$.unsubscribe] = event.detail.unsubscribe;

        if (super.connectedCallback) {
          super.connectedCallback();
        }
      }

      disconnectedCallback() {
        if (this[$$.unsubscribe]) {
          this[$$.unsubscribe](this[$$.consume]);
        }

        if (super.disconnectedCallback) {
          super.disconnectedCallback();
        }
      }

      [$$.consume](v) {
        this[contextValue] = v;
      }
    };

  return {
    consumer,
    contextValue,
    provider,
    providingValue,
  };
};

export default createContext;
