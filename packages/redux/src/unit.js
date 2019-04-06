import {tokenRegistry} from './utils';

const unit = (token, getter) => ({constructor: target}, key) => {
  target.__registrations.push(() => {
    tokenRegistry
      .get(token)
      .get(target)
      .units.set(key, getter);
  });
};

export default unit;
