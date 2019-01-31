export const lifecycleKeys = ['connectedCallback', 'disconnectedCallback'];

export const field = ({
  configurable = true,
  enumerable = true,
  extras,
  finisher,
  initializer,
  key,
  placement = 'own',
  writable = true,
}) => ({
  descriptor: {
    configurable,
    enumerable,
    writable,
  },
  extras,
  finisher,
  initializer,
  key,
  kind: 'field',
  placement,
});

export const method = ({
  configurable = true,
  bound = false,
  enumerable = true,
  extras,
  finisher,
  key,
  method: value,
  writable = true,
  placement = 'prototype',
}) =>
  bound
    ? field({
        configurable,
        enumerable,
        extras,
        finisher,
        initializer() {
          return value.bind(this);
        },
        key,
        writable,
      })
    : {
        descriptor: {
          configurable,
          enumerable,
          value,
          writable,
        },
        extras,
        finisher,
        key,
        kind: 'method',
        placement,
      };

export const accessor = ({
  adjust = methods => methods,
  configurable = true,
  enumerable = true,
  extras,
  finisher,
  get,
  initializer,
  key,
  placement = 'prototype',
  set,
}) => {
  let accessorMethods;
  let accessorField;

  if (initializer || (!get && !set)) {
    const storage = Symbol();

    accessorMethods = adjust({
      get() {
        return this[storage];
      },
      set(value) {
        this[storage] = value;
      },
    });

    accessorField = field({
      enumerable: false,
      initializer,
      key: storage,
    });
  } else {
    accessorMethods = adjust({get, set});
  }

  return {
    descriptor: {
      configurable,
      enumerable,
      ...accessorMethods,
    },
    extras: accessorField ? [...(extras || []), accessorField] : extras,
    finisher,
    key,
    kind: 'method',
    placement,
  };
};

export const hook = ({extras, placement = 'static', start}) => ({
  descriptor: {},
  extras,
  initializer: start,
  key: Symbol(),
  kind: 'field',
  placement,
});
