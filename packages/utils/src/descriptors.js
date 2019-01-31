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
  readonly = false,
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

  const finalExtras = accessorField ? [...(extras || []), accessorField] : extras;

  const worker = {
    descriptor: accessorMethods,
    kind: 'method',
    placement,
  };

  if (!readonly) {
    return {
      ...worker,
      descriptor: {
        ...worker.descriptor,
        configurable,
        enumerable,
      },
      extras: finalExtras,
      finisher,
      key,
    };
  }

  const storage = Symbol();

  return accessor({
    extras: [
      ...(extras || []),
      {
        ...worker,
        key: storage,
      },
    ],
    finisher,
    get() {
      return this[storage];
    },
    key,
    placement,
  });
};

export const hook = ({extras, placement = 'static', start}) => ({
  descriptor: {},
  extras,
  initializer: start,
  key: Symbol(),
  kind: 'field',
  placement,
});
