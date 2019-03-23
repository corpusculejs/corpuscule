const createTokenCreator = createStore => {
  const registry = new WeakMap();

  const createToken = () => {
    const token = {};
    const store = createStore();

    registry.set(token, store);

    return token;
  };

  return [createToken, registry];
};

export default createTokenCreator;
