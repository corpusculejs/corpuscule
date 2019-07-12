import {value} from '@corpuscule/context';
import {getName} from '@corpuscule/utils/lib/propertyUtils';
import {setObject} from '@corpuscule/utils/lib/setters';
import {gears, tokenRegistry} from './utils';

const gear = token => (prototype, propertyKey, descriptor) => {
  const {constructor: klass} = prototype;
  const name = getName(propertyKey);

  if (!gears.includes(name)) {
    throw new TypeError(`Property name ${name} is not allowed`);
  }

  const [sharedPropertiesRegistry] = tokenRegistry.get(token);

  if (name === 'refs') {
    let $ref;

    klass.__registrations.push(() => {
      ({ref: $ref} = sharedPropertiesRegistry.get(klass));
    });

    return {
      configurable: true,
      get() {
        return this[$ref];
      },
    };
  }

  setObject(sharedPropertiesRegistry, klass, {
    [name]: propertyKey,
  });

  return name === 'formApi' ? value(token)(prototype, propertyKey, descriptor) : descriptor;
};

export default gear;
