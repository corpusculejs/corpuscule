import {tokenRegistry} from './utils';

const unit = (token, storeKey) => ({constructor: klass}, key) => {
  klass.__registrations.push(() => {
    tokenRegistry
      .get(token)
      .get(klass)
      .units.push((self, updated) => {
        if (storeKey in updated) {
          self[key] = updated[storeKey];
        }
      });
  });
};

export default unit;
