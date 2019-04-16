import {tokenRegistry} from './utils';

const unit = (token, storeKey) => ({constructor: target}, key) => {
  target.__registrations.push(() => {
    tokenRegistry
      .get(token)
      .get(target)
      .units.push((self, updated) => {
        if (storeKey in updated) {
          self[key] = updated[storeKey];
        }
      });
  });
};

export default unit;
