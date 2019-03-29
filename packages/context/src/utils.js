import basicGetSupers from '@corpuscule/utils/lib/getSupersNew';

export const tokenRegistry = new WeakMap();

const randomString = () => {
  const arr = new Uint32Array(2);
  const [rnd1, rnd2] = crypto.getRandomValues(arr);

  return `${rnd1}${rnd2}`;
};

export const createContextToken = () => {
  const token = {};
  tokenRegistry.set(token, [randomString(), new WeakMap(), new Set()]);

  return token;
};

export const getSupers = target =>
  basicGetSupers(target, ['connectedCallback', 'disconnectedCallback']);
