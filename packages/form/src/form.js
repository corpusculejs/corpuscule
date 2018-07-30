import {
  configOptions,
  createForm,
} from "final-form";
import {
  provider,
  providingValue as $$form,
} from "./context";
import {
  handleSubmit as $$handleSubmit,
  props as $$props,
  unsubscriptions as $$unsubscriptions,
} from "./tokens/internal";
import {formInstance} from "./tokens/lifecycle";

const form = (target) => {
  const provided = provider(target);

  const {value: connectedCallback} = Reflect.getOwnPropertyDescriptor(provided.prototype, "connectedCallback");
  const {value: disconnectedCallback} = Reflect.getOwnPropertyDescriptor(provided.prototype, "disconnectedCallback");

  Object.defineProperties(provided.prototype, {
    ...configOptions.map(prop => ({
      get() {
        return this[$$props][prop];
      },
      set: prop === "initialValues" ? function set(value) {
        this[$$props][prop] = value;

        if (this[$$form]) {
          for (const v of value) {
            if (this[$$props][prop][v] !== value[v]) {
              this[$$form].initialize(value);
              this[$$props][prop] = value;
              break;
            }
          }
        }
      } : function set(value) {
        this[$$props][prop] = value;

        if (this[$$form]) {
          this[$$form].setConfig(prop, this[$$props][prop]);
        }
      },
    })),
    connectedCallback: {
      async value() {
        if (connectedCallback) {
          connectedCallback.call(this);
        }

        await null;

        const instance = createForm(this[$$props]);

        if (this.decorators) {
          for (const decorate of this.decorators) {
            this[$$unsubscriptions].push(decorate(instance));
          }
        }

        this[$$form] = instance;

        this.addEventListener("submit", this[$$handleSubmit]);
      },
    },
    decorators: {
      get() {
        return this[$$props].decorators;
      },
      set(value) {
        if (!this[$$form]) {
          this[$$props].decorators = value;

          return;
        }

        // eslint-disable-next-line consistent-return, no-console
        console.warn("Form decorators should not change");
      },
    },
    disconnectedCallback: {
      value() {
        for (const unsubscribe of this[$$unsubscriptions]) {
          unsubscribe();
        }

        this.removeEventListener("submit", this[$$handleSubmit]);

        if (disconnectedCallback) {
          disconnectedCallback.call(this);
        }
      },
    },
    [formInstance]: {
      value() {
        return this[$$form];
      },
    },
    [$$handleSubmit]: { // eslint-disable-line sort-keys
      get() {
        const handleSubmit = (e) => {
          e.preventDefault();
          e.stopPropagation();

          this[$$form].submit();
        };

        Object.defineProperty(this, $$handleSubmit, {
          value: handleSubmit,
        });

        return handleSubmit;
      },
    },
    [$$props]: {
      value: {},
    },
    [$$unsubscriptions]: {
      value: [],
    },
  });

  return target;
};

export default form;
