import {getName} from '@corpuscule/utils/lib/propertyUtils';
import {setObject} from '@corpuscule/utils/lib/setters';
import {gearResponsibilityKeys, sharedPropertiesRegistry} from './utils';

const gear = responsibilityKey => ({constructor: klass}, propertyKey) => {
  const finalResponsibilityKey = responsibilityKey || getName(propertyKey);

  if (!gearResponsibilityKeys.includes(finalResponsibilityKey)) {
    throw new TypeError(`Property name ${finalResponsibilityKey} is not allowed`);
  }

  setObject(sharedPropertiesRegistry, klass, {
    [finalResponsibilityKey]: propertyKey,
  });
};

export default gear;
