import {value} from '@corpuscule/context';
import {getName} from '@corpuscule/utils/lib/propertyUtils';
import {setObject} from '@corpuscule/utils/lib/setters';
import {apis, tokenRegistry} from './utils';

const api = (token, name) => (prototype, key, descriptor) => {
  const {constructor: target} = prototype;
  const apiName = name || getName(key);

  if (!apis.includes(apiName)) {
    throw new TypeError(`${apiName} is not allowed`);
  }

  const [sharedPropertiesRegistry] = tokenRegistry.get(token);

  if (apiName === 'refs') {
    let $ref;

    target.__registrations.push(() => {
      ({ref: $ref} = sharedPropertiesRegistry.get(target));
    });

    return {
      configurable: true,
      get() {
        return this[$ref];
      },
    };
  }

  setObject(sharedPropertiesRegistry, target, {
    [apiName]: key,
  });

  return apiName === 'formApi' ? value(token)(prototype, key, descriptor) : descriptor;
};

export default api;
