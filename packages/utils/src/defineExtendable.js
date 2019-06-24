const defineExtendable = (klass, baseClassMethods, extendedClassMethods, initializers) => {
  for (const key of Reflect.ownKeys(baseClassMethods)) {
    const selfKey = Symbol();

    klass.prototype[key] = function(...args) {
      this[selfKey](...args);
    };

    initializers.push(self => {
      self[selfKey] =
        self.constructor !== klass ? extendedClassMethods[key] : baseClassMethods[key];
    });
  }
};

export default defineExtendable;
