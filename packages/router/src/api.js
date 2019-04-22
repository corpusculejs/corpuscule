import {setObject} from '@corpuscule/utils/lib/setters';
import {tokenRegistry} from './utils';

const api = token => ({constructor: target}, key) => {
  setObject(tokenRegistry.get(token), target, {value: key});
};

export default api;
