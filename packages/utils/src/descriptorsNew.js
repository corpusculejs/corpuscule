import define from './define';

export const makeAccessor = (target, descriptor) => {
  const {get, initializer, set} = descriptor;

  if (get && set) {
    return descriptor;
  }

  const storage = Symbol();

  target.__initializers.push(self =>
    define(self, {
      [storage]: initializer ? initializer() : undefined,
    }),
  );

  return {
    get() {
      return this[storage];
    },
    set(value) {
      this[storage] = value;
    },
  };
};
