import basicGetSupers from '@corpuscule/utils/lib/getSupersNew';
import createTokenCreator from '@corpuscule/utils/lib/tokenizer';

const randomString = () => {
  const arr = new Uint32Array(2);
  const [rnd1, rnd2] = crypto.getRandomValues(arr);

  return `${rnd1}${rnd2}`;
};

export const [createContextToken, registry] = createTokenCreator(() => [
  randomString(),
  new WeakMap(),
  new Set(),
]);

export const getSupers = target =>
  basicGetSupers(target, ['connectedCallback', 'disconnectedCallback']);
