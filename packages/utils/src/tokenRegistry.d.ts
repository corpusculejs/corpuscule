/**
 * @module @corpuscule/utils/lib/tokenRegistry
 *
 * ```typescript
 * import createTokenRegistry from '@corpuscule/utils/lib/tokenRegistry'
 * ```
 */

/**
 * A key to access specific data store in the registry.
 *
 * The initial goal of the token design is to create an artificial closure for
 * the decorators which are, according to the [proposal](https://github.com/tc39/proposal-decorators/blob/master/README.md#semantic-details),
 * not JavaScript values and cannot be returned from a function or assigned to
 * a variable.
 *
 * It is often necessary to bind together several decorators to build a complex
 * system on top of their interaction. The token access approach allows
 * creating a shared store which can be obtained using the token from inside
 * the decorator. The only thing user should do is to provide the same token
 * for all decorators that have to be linked with each other.
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
 * ### Example
 * ```typescript
 *
 * const [createToken, registry] = createTokenRegistry<string[]>(() => []);
 *
 * const token = createToken();
 *
 * const arr = registry.get(token);
 *
 * arr.push('test'); // ['test']
 * ```
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
 */
export default function createTokenRegistry<T>(
  createDataStore: () => T,
  createRawToken?: TokenCreator,
): [TokenCreator, WeakMap<Token, T>];
