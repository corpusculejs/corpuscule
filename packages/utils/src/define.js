export const defaultDescriptor = {
  configurable: true,
  enumerable: true,
};

const define = (target, props) => {
  Object.assign(target, props);
};

define.raw = (target, props) => {
  Reflect.ownKeys(props).forEach(prop => {
    Object.defineProperty(target, prop, {
      ...defaultDescriptor,
      ...props[prop],
    });
  });
};

export default define;
