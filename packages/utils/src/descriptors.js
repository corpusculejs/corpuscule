export const lifecycleKeys = ['connectedCallback', 'disconnectedCallback'];

const publicDescriptor = {
  configurable: true,
  enumerable: true,
};

export const field = (
  {extras, finisher, initializer, key},
  {isPrivate = false, isReadonly = false, isStatic = false} = {},
) => ({
  descriptor: {
    ...isPrivate ? {} : publicDescriptor,
    ...isReadonly ? {} : {writable: true},
  },
  extras,
  finisher,
  initializer,
  key,
  kind: 'field',
  placement: isStatic ? 'static' : 'own',
});

export const method = (
  {extras, finisher, key, value},
  {isBound = false, isPrivate = false, isStatic = false} = {},
) => {
  if (isBound) {
    return field({
      extras,
      finisher,
      initializer() {
        return value.bind(this);
      },
      key,
    }, {isPrivate, isReadonly: true, isStatic});
  }

  return {
    descriptor: isPrivate ? {value} : {...publicDescriptor, value},
    extras,
    finisher,
    key,
    kind: 'method',
    placement: isStatic ? 'static' : 'prototype',
  };
};

export const accessor = (
  {extras, finisher, key, get, set},
  {isPrivate = false, isStatic = false} = {},
) => ({
  descriptor: isPrivate ? {get, set} : {...publicDescriptor, get, set},
  extras,
  finisher,
  key,
  kind: 'method',
  placement: isStatic ? 'static' : 'prototype',
});
