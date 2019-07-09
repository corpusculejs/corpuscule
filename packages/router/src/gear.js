import {setObject} from '@corpuscule/utils/lib/setters';
import {tokenRegistry} from './utils';

const gear = token => ({constructor: klass}, key) => {
  setObject(tokenRegistry.get(token), klass, {value: key});
};

export default gear;
