import define from '@corpuscule/utils/lib/define';
import {makeAccessor} from '@corpuscule/utils/lib/descriptorsNew';
import {setArray} from '@corpuscule/utils/lib/setters';
import createTokenCreator from '@corpuscule/utils/lib/tokenizer';
import {initializer, register} from './utils';

const [createComputingToken, registry] = createTokenCreator(() => new WeakMap());
export {createComputingToken};

export const computer = token => (prototype, key) => {
  const correct = Symbol();
  const memoized = Symbol();

  initializer(prototype, function() {
    define(this, {
      [correct]: false,
      [memoized]: null,
    });
  });

  setArray(registry.get(token), prototype, correct);

  const {get} = Reflect.getOwnPropertyDescriptor(prototype, key);

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

export const observer = token => (prototype, key) => {
  const {get: originalGet, set: originalSet} = makeAccessor(prototype, key, initializer);

  let corrects;

  register(prototype, () => {
    corrects = registry.get(token).get(prototype);
  });

  return {
    configurable: true,
    enumerable: true,
    get: originalGet,
    set(value) {
      originalSet.call(this, value);

      for (const correct of corrects) {
        this[correct] = false;
      }
    },
  };
};
