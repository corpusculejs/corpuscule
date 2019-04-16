import {createContextToken} from '@corpuscule/context';
import createTokenRegisry from '@corpuscule/utils/lib/tokenRegistry';

export const [createStoreonToken, tokenRegistry] = createTokenRegisry(
  () => new WeakMap(),
  createContextToken,
);
