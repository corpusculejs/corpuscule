export type Token = object;
export type TokenCreator = () => Token;

declare const createTokenRegistry: <T>(
  newRegistry: () => T,
  newToken?: () => Token,
) => [TokenCreator, WeakMap<Token, T>];

export default createTokenRegistry;
