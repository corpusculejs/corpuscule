declare const createTokenCreator: <T>(createStore: () => T) => [() => object, WeakMap<object, T>];

export default createTokenCreator;
