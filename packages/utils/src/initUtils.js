import {setArray} from './setters';

export const createInitializer = () => {
  const shared = new WeakMap();

  const initializer = (prototype, callback) => setArray(shared, prototype, callback);

  const applyInitializers = self => {
    const {
      constructor: {prototype},
    } = self;

    if (shared.has(prototype)) {
      for (const callback of shared.get(prototype)) {
        callback.call(self);
      }
    }
  };

  return [initializer, applyInitializers];
};

export const createRegistrator = () => {
  const shared = new WeakMap();

  const register = (prototype, callback) => setArray(shared, prototype, callback);

  const applyRegistrations = prototype => {
    if (shared.has(prototype)) {
      for (const callback of shared.get(prototype)) {
        callback();
      }
    }
  };

  return [register, applyRegistrations];
};
