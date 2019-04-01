const defineExtendable = (target, methods, supers) =>
  Reflect.ownKeys(methods).forEach(key => {
    const selfKey = Symbol();

    target.prototype[key] = function(...args) {
      this[selfKey](...args);
    };

    target.__initializers.push(self => {
      self[selfKey] = self.constructor !== target ? supers[key] : methods[key];
    });
  });

export default defineExtendable;
