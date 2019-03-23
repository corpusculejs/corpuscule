import define from './define';

export const createAccessorMaker = initializer => (prototype, descriptor) => {
  if (descriptor.get && descriptor.set) {
    return descriptor;
  }

  const storage = Symbol();

  initializer(prototype, function() {
    define(this, {
      [storage]: descriptor.initializer(),
    });
  });

  return {
    get() {
      return this[storage];
    },
    set(value) {
      this[storage] = value;
    },
  };
};
