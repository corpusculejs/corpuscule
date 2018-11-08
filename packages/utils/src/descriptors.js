const publicDescriptor = {
  configurable: true,
  enumerable: true,
};

// Methods
export const method = ({extras, finisher, key, value}) => ({
  descriptor: {
    ...publicDescriptor,
    value,
  },
  extras,
  finisher,
  key,
  kind: 'method',
  placement: 'prototype',
});

export const accessor = params => ({
  ...method(params),
  descriptor: {
    ...publicDescriptor,
    get: params.get,
    set: params.set,
  },
});

export const privateMethod = params => ({
  ...method(params),
  descriptor: {
    value: params.value,
  },
});

// Fields
export const readonlyField = ({extras, finisher, initializer, key}) => ({
  descriptor: publicDescriptor,
  extras,
  finisher,
  initializer,
  key,
  kind: 'field',
  placement: 'own',
});

export const privateField = params => ({
  ...readonlyField(params),
  descriptor: {
    writable: true,
  },
});

// Other
export const toStatic = descriptor => ({
  ...descriptor,
  placement: 'static',
});
