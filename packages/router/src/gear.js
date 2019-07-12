import {setObject} from '@corpuscule/utils/lib/setters';
import {tokenRegistry} from './utils';

const gear = token => ({constructor: klass}, propertyKey) => {
  setObject(tokenRegistry.get(token), klass, {value: propertyKey});
};

export default gear;
