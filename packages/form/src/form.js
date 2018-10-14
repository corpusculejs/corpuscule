import assertKind from "@corpuscule/utils/lib/assertKind";
import getSuperMethod from "@corpuscule/utils/lib/getSuperMethod";
import shallowEqual from "@corpuscule/utils/lib/shallowEqual";
import {
  configOptions,
  createForm,
  formSubscriptionItems,
} from "final-form";
import {
  provider,
  providingValue as $$form,
} from "./context";
import {
  handleSubmit as $$handleSubmit,
  options as $$options,
  unsubscriptions as $$unsubscriptions,
} from "./tokens/internal";
import {formInstance, formValues} from "./tokens/lifecycle";

const connectedCallbackKey = "connectedCallback";
const disconnectedCallbackKey = "disconnectedCallback";

export const all = formSubscriptionItems.reduce((result, key) => {
  result[key] = true;

  return result;
}, {});

const form = ({decorators, subscription}) => (classDescriptor) => {
  assertKind("form", "class", classDescriptor.kind);

  const {elements, kind} = provider(classDescriptor);

  const superConnectedCallback = getSuperMethod(connectedCallbackKey, elements);
  const superDisconnectedCallback = getSuperMethod(disconnectedCallbackKey, elements);

  return {
    elements: [
      ...elements.filter(({key}) =>
        key !== connectedCallbackKey
        && key !== disconnectedCallbackKey
      ),
      ...configOptions.map(option => ({
        descriptor: {
          get() {
            return this[$$options][option];
          },
          set: option === "initialValues" ? function setInitialValues(values) {
            if (!(this.initialValuesEqual || shallowEqual)(
              this[$$options].initialValues,
              values
            )) {
              this[$$options].initialValues = values;

              if (this[$$form]) {
                this[$$form].initialize(values);
              }
            }
          } : function setOption(value) {
            if (this[$$options][option] !== value) {
              this[$$options][option] = value;

              if (this[$$form]) {
                this[$$form].setConfig(option, value);
              }
            }
          },
        },
        key: option,
        kind: "method",
        placement: "prototype",
      })),
      {
        descriptor: {
          value() {
            this[$$form] = createForm(this[$$options]);

            if (decorators) {
              for (const decorate of decorators) {
                this[$$unsubscriptions].push(decorate(this[$$form]));
              }
            }

            // Subscribe, set state and unsubscribe immediately
            this[$$form].subscribe((state) => {
              this[formValues] = state;
            }, subscription || all)();

            this.addEventListener("submit", this[$$handleSubmit]);

            return superConnectedCallback(this);
          },
        },
        key: connectedCallbackKey,
        kind: "method",
        placement: "prototype",
      },
      {
        descriptor: {
          value() {
            for (const unsubscribe of this[$$unsubscriptions]) {
              unsubscribe();
            }

            this.removeEventListener("submit", this[$$handleSubmit]);

            superDisconnectedCallback();
          },
        },
        key: disconnectedCallbackKey,
        kind: "method",
        placement: "prototype",
      },
      {
        descriptor: {
          get() {
            return this[$$form];
          },
        },
        key: formInstance,
        kind: "method",
        placement: "prototype",
      },
      {
        descriptor: {},
        initializer() {
          return (event) => {
            event.preventDefault();
            event.stopPropagation();

            this[$$form].submit();
          };
        },
        key: $$handleSubmit,
        kind: "field",
        placement: "own",
      },
      {
        descriptor: {},
        initializer: () => ({}),
        key: $$options,
        kind: "field",
        placement: "own",
      },
      {
        descriptor: {},
        initializer: () => [],
        key: $$unsubscriptions,
        kind: "field",
        placement: "own",
      },
    ],
    kind,
  };
};

export default form;
