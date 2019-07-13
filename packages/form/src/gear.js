import {value} from '@corpuscule/context';
import {getName} from '@corpuscule/utils/lib/propertyUtils';
import {setObject} from '@corpuscule/utils/lib/setters';
import {gearsResponsibilityKeys, tokenRegistry} from './utils';

const gear = (token, responsibilityKey) => (prototype, propertyKey, descriptor) => {
  const {constructor: klass} = prototype;
  const finalResponsibilityKey = responsibilityKey || getName(propertyKey);

  if (!gearsResponsibilityKeys.includes(finalResponsibilityKey)) {
    throw new TypeError(`Property name ${finalResponsibilityKey} is not allowed`);
  }

  const sharedPropertiesRegistry = tokenRegistry.get(token);

  if (finalResponsibilityKey === 'refs') {
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
    [finalResponsibilityKey]: propertyKey,
  });

  return finalResponsibilityKey === 'formApi'
    ? value(token)(prototype, propertyKey, descriptor)
    : descriptor;
};

export default gear;
