const createTokenRegistry = (createDataStore, createRawToken = () => ({})) => {
  const tokenRegistry = new WeakMap();

  const createToken = () => {
    const token = createRawToken();
    const registry = createDataStore();

    tokenRegistry.set(token, registry);

    return token;
  };

  return [createToken, tokenRegistry];
};

export default createTokenRegistry;
