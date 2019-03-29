import {createContextToken} from '@corpuscule/context';
import createTokenRegisry from '@corpuscule/utils/lib/tokenRegistry';

export const [createReduxToken, tokenRegistry] = createTokenRegisry(
  () => new WeakMap(),
  createContextToken,
);
