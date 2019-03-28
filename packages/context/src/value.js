import {makeAccessor} from '@corpuscule/utils/lib/descriptorsNew';
import {setObject} from '@corpuscule/utils/lib/setters';
import {registry} from './utils';

const value = token => ({constructor: target}, key, {initializer, ...descriptor}) => {
  let $$consumers;
  let isProvider;

  const [, values, providers] = registry.get(token);

  setObject(values, target, {
    value: key,
  });

  target.__registrations.push(() => {
    ({consumers: $$consumers} = values.get(target));
    isProvider = providers.has(target);
  });

  const {get, set} = makeAccessor(target, {
    ...descriptor,
    initializer() {
      return isProvider && initializer ? initializer.call(this) : undefined;
    },
  });

  return {
    configurable: true,
    enumerable: true,
    get,
    set(v) {
      set.call(this, v);

      if (isProvider) {
        for (const callback of this[$$consumers]) {
          callback(v);
        }
      }
    },
  };
};

export default value;
