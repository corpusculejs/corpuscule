const createTokenRegistry = (newRegistry, newToken = () => ({})) => {
  const registry = new WeakMap();

  const createToken = () => {
    const token = newToken();
    const store = newRegistry();

    registry.set(token, store);

    return token;
  };

  return [createToken, registry];
};

export default createTokenRegistry;
