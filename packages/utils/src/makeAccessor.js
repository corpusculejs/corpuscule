const makeAccessor = (target, descriptor) => {
  const {get, initializer, set} = descriptor;

  if (get && set) {
    return descriptor;
  }

  const storage = Symbol();

  target.__initializers.push(self => {
    self[storage] = initializer ? initializer.call(self) : undefined;
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

export default makeAccessor;
