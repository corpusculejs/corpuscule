import makeAccessor from '@corpuscule/utils/lib/makeAccessor';
import {setArray} from '@corpuscule/utils/lib/setters';
import createTokenRegistry from '@corpuscule/utils/lib/tokenRegistry';

const [createComputingToken, tokenRegistry] = createTokenRegistry(() => new WeakMap());

export {createComputingToken};

export const computer = token => ({constructor: klass}, _, {get}) => {
  const correct = Symbol();
  const memoized = Symbol();

  klass.__initializers.push(self => {
    self[correct] = false;
    self[memoized] = null;
  });

  setArray(tokenRegistry.get(token), klass, [correct]);

  return {
    configurable: true,
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
  const {get, set} = makeAccessor(descriptor, target.__initializers);

  let corrects;

  target.__registrations.push(() => {
    corrects = tokenRegistry.get(token).get(target);
  });

  return {
    configurable: true,
    get,
    set(value) {
      set.call(this, value);

      for (const correct of corrects) {
        this[correct] = false;
      }
    },
  };
};
