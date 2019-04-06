import {createContextToken} from '@corpuscule/context';
import createTokenRegistry from '@corpuscule/utils/lib/tokenRegistry';

export const [createRouterToken, tokenRegistry] = createTokenRegistry(
  () => new WeakMap(),
  createContextToken,
);
