import {value} from '@corpuscule/context';
import {getName} from '@corpuscule/utils/lib/propertyUtils';
import {setObject} from '@corpuscule/utils/lib/setters';
import {tokenRegistry} from './utils';

const api = token => (prototype, key, descriptor) => {
  const name = getName(key);

  if (name === 'layout' || name === 'route') {
    setObject(tokenRegistry.get(token), prototype.constructor, {
      [name]: key,
    });

    return descriptor;
  }

  return value(token)(prototype, key, descriptor);
};

export default api;
