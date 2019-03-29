import define from '@corpuscule/utils/lib/define';
import {makeAccessor} from '@corpuscule/utils/lib/descriptorsNew';
import {setArray} from '@corpuscule/utils/lib/setters';

const tokenRegistry = new WeakMap();

export const createComputingToken = () => {
  const token = {};
  tokenRegistry.set(token, new WeakMap());

  return token;
};

export const computer = token => ({constructor: target}, _, {get}) => {
  const correct = Symbol();
  const memoized = Symbol();

  target.__initializers.push(self =>
    define(self, {
      [correct]: false,
      [memoized]: null,
    }),
  );

  setArray(tokenRegistry.get(token), target, correct);

  return {
    configurable: true,
    enumerable: true,
    get() {
      if (!this[correct]) {
        this[memoized] = get.call(this);
        this[correct] = true;
      }

      return this[memoized];
    },
  };
};

export const observer = token => ({constructor: target}, _, descriptor) => {
  const {get, set} = makeAccessor(target, descriptor);

  let corrects;

  target.__registrations.push(() => {
    corrects = tokenRegistry.get(token).get(target);
  });

  return {
    configurable: true,
    enumerable: true,
    get,
    set(value) {
      set.call(this, value);

      for (const correct of corrects) {
        this[correct] = false;
      }
    },
  };
};
