import {tokenRegistry} from './utils';

const dispatcher = (token, eventName) => (prototype, _, descriptor) => {
  let $store;
  const {constructor: klass} = prototype;

  klass.__registrations.push(() => {
    ({store: $store} = tokenRegistry.get(token).get(klass));
  });

  return {
    configurable: true,
    enumerable: false,
    value: eventName
      ? 'initializer' in descriptor
        ? function(data) {
            this[$store].dispatch(eventName, data);
          }
        : function(...args) {
            this[$store].dispatch(eventName, descriptor.value.apply(this, args));
          }
      : function(...args) {
          this[$store].dispatch(...args);
        },
  };
};

export default dispatcher;
