import {tokenRegistry} from './utils';

const unit = (token, getter) => ({constructor: klass}, key) => {
  klass.__registrations.push(() => {
    tokenRegistry
      .get(token)
      .get(klass)
      .units.push((self, state) => {
        const value = getter(state);

        if (value !== self[key]) {
          self[key] = value;
        }
      });
  });
};

export default unit;
