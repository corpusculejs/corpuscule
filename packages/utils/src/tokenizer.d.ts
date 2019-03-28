export type Token = object;
export type TokenCreator = () => Token;

declare const createTokenCreator: <T>(createStore: () => T) => [TokenCreator, WeakMap<Token, T>];

export default createTokenCreator;
