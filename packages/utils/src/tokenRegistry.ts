export type Token = {};

const createTokenRegistry = <S, P = never>(
  createDataStore: () => S,
  createRawToken: () => Token = () => ({}),
  shareStorePart?: (store: S) => P,
): [
  () => Token,
  WeakMap<Token, S>,
  P extends never ? null : (token: Token) => P | undefined,
] => {
  const tokenRegistry = new WeakMap<Token, S>();

  const createToken = (): Token => {
    const token = createRawToken();
    const registry = createDataStore();

    tokenRegistry.set(token, registry);

    return token;
  };

  const share = shareStorePart
    ? (token: Token): P | undefined =>
        tokenRegistry.has(token)
          ? shareStorePart(tokenRegistry.get(token)!)
          : undefined
    : null;

  return [createToken, tokenRegistry, share as any];
};

export default createTokenRegistry;
