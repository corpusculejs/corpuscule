import {context as $$context} from "./tokens/internal";

export const connectedRegistry = new WeakMap();

export const connected = getter => (prototype, propertyName) => {
  const record = [propertyName, getter];

  if (connectedRegistry.has(prototype)) {
    connectedRegistry.get(prototype).set(...record);
  } else {
    connectedRegistry.set(prototype, new Map([record]));
  }
};

export const dispatcher = (prototype, propertyName) => {
  const descriptor = Object.getOwnPropertyDescriptor(prototype, propertyName);

  return descriptor && descriptor.value ? {
    value(...args) {
      this[$$context].dispatch(descriptor.value.apply(this, args));
    },
  } : {
    configurable: true,
    set(value) {
      Object.defineProperty(this, propertyName, {
        configurable: true,
        value(...args) {
          this[$$context].dispatch(value(...args));
        },
      });
    },
  };
};
