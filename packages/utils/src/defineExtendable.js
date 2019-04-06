const defineExtendable = (target, methods, supers, initializers) =>
  Reflect.ownKeys(methods).forEach(key => {
    const selfKey = Symbol();

    target.prototype[key] = function(...args) {
      this[selfKey](...args);
    };

    initializers.push(self => {
      self[selfKey] = self.constructor !== target ? supers[key] : methods[key];
    });
  });

export default defineExtendable;
