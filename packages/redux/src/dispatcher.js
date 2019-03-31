import {tokenRegistry} from './utils';

const dispatcher = token => ({constructor: target}, key, descriptor) => {
  const {initializer, value} = descriptor;

  let $store;

  target.__registrations.push(() => {
    ({store: $store} = tokenRegistry.get(token).get(target));
  });

  if ('initializer' in descriptor) {
    const actionCreator = initializer && initializer();

    if (!actionCreator || typeof actionCreator !== 'function') {
      throw new TypeError(`@dispatcher "${key}" should be initialized with a function`);
    }

    target.__initializers.push(self => {
      self[key] = (...args) => {
        self[$store].dispatch(actionCreator(...args));
      };
    });

    return descriptor;
  }

  target.__initializers.push(self => {
    self[key] = (...args) => {
      self[$store].dispatch(value.apply(self, args));
    };
  });

  return descriptor;
};

export default dispatcher;
