import {tokenRegistry} from './utils';

const unit = (token, getter) => ({constructor: target}, key) => {
  target.__registrations.push(() => {
    tokenRegistry
      .get(token)
      .get(target)
      .units.push((self, state) => {
        const value = getter(state);

        if (value !== self[key]) {
          self[key] = value;
        }
      });
  });
};

export default unit;
