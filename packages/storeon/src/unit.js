import {tokenRegistry} from './utils';

const unit = (token, storeKey) => ({constructor: klass}, propertyKey) => {
  klass.__registrations.push(() => {
    tokenRegistry
      .get(token)
      .get(klass)
      .units.push((self, updated) => {
        if (storeKey in updated) {
          self[propertyKey] = updated[storeKey];
        }
      });
  });
};

export default unit;
