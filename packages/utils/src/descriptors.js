export const lifecycleKeys = ['connectedCallback', 'disconnectedCallback'];

export const field = ({
  configurable = true,
  enumerable = true,
  kind: _,
  writable = true,
  ...other
}) => ({
  descriptor: {
    configurable,
    enumerable,
    writable,
  },
  key: Symbol(),
  kind: 'field',
  placement: 'own',
  ...other,
});

export const method = ({
  configurable = true,
  bound = false,
  enumerable = true,
  kind: _,
  method: value,
  writable = true,
  ...other
}) =>
  bound
    ? field({
        configurable,
        enumerable,
        initializer() {
          return value.bind(this);
        },
        writable,
        ...other,
      })
    : {
        descriptor: {
          configurable,
          enumerable,
          value,
          writable,
        },
        kind: 'method',
        placement: 'prototype',
        ...other,
      };

export const accessor = ({
  adjust = methods => methods,
  configurable = true,
  get,
  enumerable = true,
  extras,
  initializer,
  kind: _,
  set,
  ...other
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
    kind: 'method',
    placement: 'prototype',
    ...other,
  };
};
