import createContext from "@corpuscule/context";
import * as $$ from "./tokens/internal";
import {dispatcherMap, connectedMap} from "./tokens/lifecycle";
import {getDescriptors} from "./utils";

const {
  consumer,
  contextValue: context,
  provider,
  providingValue: store,
} = createContext();

export {
  dispatcherMap,
  provider,
  connectedMap,
  store,
};

export const connect = (target) => {
  class ReduxConnected extends consumer(target) {
    static get observedAttributes() {
      if (this[connectedMap]) {
        this[$$.registry] = Object.entries(getDescriptors(this, connectedMap));
      }

      if (this[dispatcherMap]) {
        this[$$.initDispatchers](getDescriptors(this, dispatcherMap));
      }

      return super.observedAttributes || [];
    }

    static [$$.initDispatchers](dispatchers) {
      for (const propertyName of dispatchers) {
        const method = this.prototype[propertyName];

        if (!method) {
          // eslint-disable-next-line accessor-pairs
          Object.defineProperty(this.prototype, propertyName, {
            configurable: true,
            set(value) {
              Object.defineProperty(this, propertyName, {
                configurable: true,
                value(...args) {
                  this[$$.context].dispatch(value(...args));
                },
              });
            },
          });

          continue;
        }

        Object.defineProperty(this.prototype, propertyName, {
          value(...args) {
            this[$$.context].dispatch(method.call(this, ...args));
          },
        });
      }
    }

    set [context](v) {
      this[$$.context] = v;

      if (this[$$.unsubscribe]) {
        this[$$.unsubscribe]();
      }

      this[$$.subscribe]();
    }

    attributeChangedCallback(...args) {
      if (super.attributeChangedCallback) {
        super.attributeChangedCallback(...args);
      }
    }

    disconnectedCallback() {
      if (super.disconnectedCallback) {
        super.disconnectedCallback();
      }

      if (this[$$.unsubscribe]) {
        this[$$.unsubscribe]();
      }
    }

    [$$.subscribe]() {
      this[$$.update](this[$$.context]);

      this[$$.unsubscribe] = this[$$.context].subscribe(() => {
        this[$$.update](this[$$.context]);
      });
    }

    [$$.update]({getState}) {
      if (!this.constructor[$$.registry]) {
        return;
      }

      for (const [propertyName, getter] of this.constructor[$$.registry]) {
        const nextValue = getter(getState());

        if (nextValue !== this[propertyName]) {
          this[propertyName] = nextValue;
        }
      }
    }
  }

  return ReduxConnected;
};
