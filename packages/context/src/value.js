import makeAccessor from '@corpuscule/utils/lib/makeAccessor';
import {setObject} from '@corpuscule/utils/lib/setters';
import {tokenRegistry} from './utils';

const value = token => (
  {constructor: target},
  key,
  {initializer, ...descriptor} = {},
) => {
  let $$consumers;
  let isProvider;

  const [, values, providers] = tokenRegistry.get(token);

  setObject(values, target, {
    value: key,
  });

  target.__registrations.push(() => {
    ({consumers: $$consumers} = values.get(target));
    isProvider = providers.has(target);
  });

  const {get, set} = makeAccessor(
    {
      ...descriptor,
      initializer() {
        return isProvider && initializer ? initializer.call(this) : undefined;
      },
    },
    target.__initializers,
  );

  return {
    configurable: true,
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
