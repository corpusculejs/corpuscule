const createTokenRegistry = (newRegistry, newToken = () => ({})) => {
  const tokenRegistry = new WeakMap();

  const createToken = () => {
    const token = newToken();
    const registry = newRegistry();

    tokenRegistry.set(token, registry);

    return token;
  };

  return [createToken, tokenRegistry];
};

export default createTokenRegistry;
