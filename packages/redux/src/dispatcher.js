import {tokenRegistry} from './utils';

const dispatcher = token => ({constructor: klass}, propertyKey, descriptor) => {
  const {initializer, value} = descriptor;

  let $store;

  klass.__registrations.push(() => {
    ({store: $store} = tokenRegistry.get(token).get(klass));
  });

  let callback;

  if ('initializer' in descriptor) {
    const actionCreator = initializer && initializer();

    if (!actionCreator || typeof actionCreator !== 'function') {
      throw new TypeError(`@dispatcher "${propertyKey}" should be initialized with a function`);
    }

    callback = function(...args) {
      this[$store].dispatch(actionCreator(...args));
    };
  } else {
    callback = function(...args) {
      this[$store].dispatch(value.apply(this, args));
    };
  }

  return {
    configurable: true,
    enumerable: false,
    value: callback,
    writable: true,
  };
};

export default dispatcher;
