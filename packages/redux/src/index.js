import createContext from "@corpuscule/context";
import * as $$ from "./tokens/internal";
import {storedMap} from "./tokens/lifecycle";

const {
  provider,
  consumer: basicConsumer,
  value: store,
} = createContext();

export {
  provider,
  storedMap,
  store,
};

export const consumer = target =>
  class ReduxConsumer extends basicConsumer(target) {
    constructor() {
      super();
      this[$$.registry] = Object.entries(this.constructor[storedMap]);
    }

    set [store](v) {
      super[store] = v;

      if (this[$$.unsubscribe]) {
        this[$$.unsubscribe]();
      }

      this[$$.subscribe]();
    }

    disconnectedCallback() {
      if (super.disconnectedCallback) {
        super.disconnectedCallback();
      }

      this[$$.unsubscribe]();
    }

    [$$.subscribe]() {
      this[$$.update](this[store]);

      this[$$.unsubscribe] = this[store].subscribe(() => {
        this[$$.update](this[store]);
      });
    }

    [$$.update]({getState}) {
      for (const [propertyName, getter] of this[$$.registry]) {
        const nextValue = getter(getState());

        if (nextValue !== this[propertyName]) {
          this[propertyName] = nextValue;
        }
      }
    }
  };
