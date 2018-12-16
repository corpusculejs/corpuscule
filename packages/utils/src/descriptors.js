export const lifecycleKeys = ['connectedCallback', 'disconnectedCallback'];

export const field = (
  {extras, finisher, initializer, key},
  {isPrivate = false, isReadonly = false, isStatic = false} = {},
) => ({
  descriptor: {
    ...(isPrivate ? {} : {configurable: true, enumerable: true}),
    ...(isReadonly ? {} : {writable: true}),
  },
  extras,
  finisher,
  initializer,
  key: key || Symbol(),
  kind: 'field',
  placement: isStatic ? 'static' : 'own',
});

export const method = (
  {extras, finisher, key, value},
  {isBound = false, isPrivate = false, isStatic = false} = {},
) => {
  if (isBound) {
    return field(
      {
        extras,
        finisher,
        initializer() {
          return value.bind(this);
        },
        key,
      },
      {isPrivate, isStatic},
    );
  }

  return {
    descriptor: isPrivate ? {value} : {configurable: true, value},
    extras,
    finisher,
    key,
    kind: 'method',
    placement: isStatic ? 'static' : 'prototype',
  };
};

export const accessor = (
  {extras, finisher, initializer, key, get, set},
  {adjust = methods => methods, isPrivate = false, isStatic = false, toArray = false} = {},
) => {
  let accessorMethods;
  let accessorField;

  if (initializer) {
    const storage = Symbol();

    accessorMethods = adjust({
      get() {
        return this[storage];
      },
      set(value) {
        this[storage] = value;
      },
    });

    accessorField = field(
      {
        initializer,
        key: storage,
      },
      {isPrivate: true},
    );
  } else {
    accessorMethods = adjust({get, set});
  }

  const result = {
    descriptor: isPrivate ? accessorMethods : {configurable: true, ...accessorMethods},
    extras,
    finisher,
    key,
    kind: 'method',
    placement: isStatic ? 'static' : 'prototype',
  };

  if (accessorField) {
    return toArray
      ? [result, accessorField]
      : {
          ...result,
          extras: Array.isArray(extras) ? [...extras, accessorField] : [accessorField],
        };
  }

  return result;
};
