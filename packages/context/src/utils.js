import basicGetSupers from '@corpuscule/utils/lib/getSupersNew';
import createTokenRegistry from '@corpuscule/utils/lib/tokenRegistry';

const randomString = () => {
  const arr = new Uint32Array(2);
  const [rnd1, rnd2] = crypto.getRandomValues(arr);

  return `${rnd1}${rnd2}`;
};

export const [createContextToken, tokenRegistry] = createTokenRegistry(() => [
  randomString(),
  new WeakMap(),
  new Set(),
]);

export const getSupers = target =>
  basicGetSupers(target, ['connectedCallback', 'disconnectedCallback']);
