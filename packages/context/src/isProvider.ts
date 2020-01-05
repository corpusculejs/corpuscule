import {Constructor} from '@corpuscule/typings';
import {Token} from '@corpuscule/utils/lib/tokenRegistry';
import {tokenRegistry} from './utils';

const isProvider = (token: Token, klass: Constructor<object>): boolean => {
  const [, , providers] = tokenRegistry.get(token)!;

  return providers.has(klass);
};

export default isProvider;
