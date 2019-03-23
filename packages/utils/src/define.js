const nothing = {};

const define = (target, props, options = nothing) => {
  Object.defineProperties(
    target,
    Reflect.ownKeys(props).reduce((list, name) => {
      const {configurable = true, enumerable = true, writable = true} = options[name] || nothing;

      list[name] = {
        configurable,
        enumerable,
        value: props[name],
        writable,
      };

      return list;
    }, {}),
  );
};

export default define;
