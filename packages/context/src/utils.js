import basicReflectClassMethods from '@corpuscule/utils/lib/reflectClassMethods';
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

export const reflectClassMethods = target =>
  basicReflectClassMethods(target, ['connectedCallback', 'disconnectedCallback']);
