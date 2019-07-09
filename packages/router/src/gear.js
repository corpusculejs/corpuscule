import {setObject} from '@corpuscule/utils/lib/setters';
import {tokenRegistry} from './utils';

const gear = token => ({constructor: target}, key) => {
  setObject(tokenRegistry.get(token), target, {value: key});
};

export default gear;
