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
  initProps as $$initProps,
  props as $$props,
  unsubscriptions as $$unsubscriptions,
} from "./tokens/internal";
import {formInstance} from "./tokens/lifecycle";

const form = target =>
  class FinalForm extends provider(target) {
    static get observedAttributes() {
      this[$$initProps](configOptions);

      return super.observedAttributes || [];
    }

    static [$$initProps](props) {
      for (const prop of props) {
        Object.defineProperty(this.prototype, prop, {
          get() {
            return this[$$props][prop];
          },
          set(value) {
            this[$$props][prop] = value;

            if (this[$$form]) {
              if (prop === "initialValues") {
                for (const v of value) {
                  if (this[$$props][prop][v] !== value[v]) {
                    this[$$form].initialize(value);
                    this[$$props][prop] = value;
                    break;
                  }
                }
              } else {
                this[$$form].setConfig(prop, this[$$props][prop]);
              }
            }
          },
        });
      }
    }

    get decorators() {
      return this[$$props].decorators;
    }

    set decorators(value) {
      if (!this[$$form]) {
        this[$$props].decorators = value;

        return;
      }

      // eslint-disable-next-line consistent-return, no-console
      console.warn("Form decorators should not change");
    }

    get [formInstance]() {
      return this[$$form];
    }

    constructor() {
      super();
      this[$$props] = {};
      this[$$unsubscriptions] = [];
      this[$$handleSubmit] = this[$$handleSubmit].bind(this);
    }

    attributeChangedCallback(...args) {
      if (super.attributeChangedCallback) {
        super.attributeChangedCallback(...args);
      }
    }

    async connectedCallback() {
      if (super.connectedCallback) {
        super.connectedCallback();
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
    }

    disconnectedCallback() {
      for (const unsubscribe of this[$$unsubscriptions]) {
        unsubscribe();
      }

      this.removeEventListener("submit", this[$$handleSubmit]);

      if (super.disconnectedCallback) {
        super.disconnectedCallback();
      }
    }

    [$$handleSubmit](e) {
      e.preventDefault();
      e.stopPropagation();

      this[$$form].submit();
    }
  };

export default form;
