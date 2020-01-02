export type Token = {};

const createTokenRegistry = <Store>(
  createDataStore: () => Store,
  createRawToken: () => Token = () => ({}),
): [() => Token, WeakMap<Token, Store>] => {
  const tokenRegistry = new WeakMap<Token, Store>();

  const createToken = (): Token => {
    const token = createRawToken();
    const registry = createDataStore();

    tokenRegistry.set(token, registry);

    return token;
  };

  return [createToken, tokenRegistry];
};

export default createTokenRegistry;
