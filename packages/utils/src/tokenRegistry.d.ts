/**
 * @module tokenRegistry
 *
 * @import ```typescript
 *
 * import createTokenRegistry from '@corpuscule/utils/lib/tokenRegistry'
 * ```
 */

/**
 * A key to access specific data store in the registry.
 */
export type Token = object;

/**
 * A function that creates tokens.
 */
export type TokenCreator = () => Token;

/**
 * Creates:
 * * a key-value registry where the key is a unique token and the value
 * is a data store;
 * * a function to generate a token.
 *
 * @typeparam T type of the data store.
 *
 * @param createDataStore a function to create a new data store for the new
 * token. The function will be called during the `createToken` function call.
 *
 * @param createRawToken a function that will be used to generate a new token
 * during the `createToken` call. It is optional, but you can use it to inherit
 * an already existing token system. To do it, send the `createToken` you want
 * to inherit as this argument.
 *
 * @returns a tuple which contains the new `createToken` function and the
 * registry instance.
 *
 * @example ```typescript
 *
 * const [createToken, registry] = createTokenRegistry<string[]>(() => []);
 *
 * const token = createToken();
 *
 * const arr = registry.get(token);
 *
 * arr.push('test'); // ['test']
 * ```
 */
export default function createTokenRegistry<T>(
  createDataStore: () => T,
  createRawToken?: TokenCreator,
): [TokenCreator, WeakMap<Token, T>];
