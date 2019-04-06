const makeAccessor = (descriptor, initializers) => {
  const {get, initializer, set} = descriptor;

  if (get && set) {
    return descriptor;
  }

  const storage = Symbol();

  initializers.push(self => {
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
