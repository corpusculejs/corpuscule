import {Constructor, CustomElement} from '@corpuscule/typings';
import {Token} from '@corpuscule/utils/lib/tokenRegistry';
import {tokenRegistry} from '../lib/utils';

const isProvider = (
  token: Token,
  klass: Constructor<CustomElement>,
): boolean => {
  const [, , $providers] = tokenRegistry.get(token)!;

  return $providers.has(klass);
};

export default isProvider;
