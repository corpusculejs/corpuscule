import {context as $$context} from "./tokens/internal";
import addToRegistry from "@corpuscule/utils/lib/addToRegistry";

export const connectedRegistry = new WeakMap();

export const connected = getter => (descriptor) => {
  if (descriptor.kind !== "field") {
    throw new TypeError(`@connected can be applied only to class field and "${descriptor.key}" is not a field`);
  }

  return {
    ...descriptor,
    finisher(target) {
      addToRegistry(connectedRegistry, target, descriptor.key, getter);
    },
  };
};

export const dispatcher = ({
  descriptor,
  initializer,
  key,
  kind,
  placement,
}) => {
  if (kind === "method") {
    return {
      descriptor,
      extras: [{
        descriptor: {
          configurable: true,
        },
        initializer() {
          return (...args) => {
            this[$$context].dispatch(descriptor.value.apply(this, args));
          };
        },
        key,
        kind: "field",
        placement: "own",
      }],
      key,
      kind,
      placement,
    };
  } else if (kind === "field") {
    const initialized = initializer ? initializer() : undefined;

    if (!initialized || typeof initialized !== "function") {
      throw new Error(`@dispatcher: "${key}" should be initialized with a function`);
    }

    return {
      descriptor,
      initializer() {
        return (...args) => {
          this[$$context].dispatch(initialized.apply(this, args));
        };
      },
      key,
      kind,
      placement,
    };
  }

  throw new TypeError(`@dispatcher can be applied only to fields and methods and "${key}" is not a field or method`);
};
