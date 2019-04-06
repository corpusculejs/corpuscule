import {value} from '@corpuscule/context';
import {getName} from '@corpuscule/utils/lib/propertyUtils';
import {setObject} from '@corpuscule/utils/lib/setters';
import {apis, tokenRegistry} from './utils';

const api = token => (prototype, key, descriptor) => {
  const {constructor: target} = prototype;
  const name = getName(key);

  if (!apis.includes(name)) {
    throw new TypeError(`Property name ${name} is not allowed`);
  }

  const [sharedPropertiesRegistry] = tokenRegistry.get(token);

  if (name === 'refs') {
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
    [name]: key,
  });

  return name === 'formApi' ? value(token)(prototype, key, descriptor) : descriptor;
};

export default api;
