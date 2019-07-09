import {tokenRegistry} from './utils';

const dispatcher = (token, eventKey) => (prototype, _, descriptor) => {
  let $store;
  const {constructor: klass} = prototype;

  klass.__registrations.push(() => {
    ({store: $store} = tokenRegistry.get(token).get(klass));
  });

  return {
    configurable: true,
    enumerable: false,
    value: eventKey
      ? 'initializer' in descriptor
        ? function(data) {
            this[$store].dispatch(eventKey, data);
          }
        : function(...args) {
            this[$store].dispatch(eventKey, descriptor.value.apply(this, args));
          }
      : function(...args) {
          this[$store].dispatch(...args);
        },
  };
};

export default dispatcher;
