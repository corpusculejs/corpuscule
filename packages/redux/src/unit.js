import {tokenRegistry} from './utils';

const unit = (token, getter) => ({constructor: klass}, propertyKey) => {
  klass.__registrations.push(() => {
    tokenRegistry
      .get(token)
      .get(klass)
      .units.push((self, state) => {
        const value = getter(state);

        if (value !== self[propertyKey]) {
          self[propertyKey] = value;
        }
      });
  });
};

export default unit;
