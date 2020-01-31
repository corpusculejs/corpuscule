/* istanbul ignore next */
import {Exact} from '@corpuscule/typings';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = (): void => {};

export type Reflection<O, F, K extends PropertyKey> = {
  [P in K]: P extends keyof O
    ? Exclude<O[P], undefined>
    : P extends keyof F
    ? Exclude<F[P], undefined>
    : typeof noop;
};

const reflectMethods = <
  O,
  F extends Record<K, Function>,
  K extends PropertyKey
>(
  object: O & Partial<Record<K, Function>>,
  methodNames: readonly K[],
  fallbacks: Partial<Exact<F, Record<K, Function>>> = {},
): Reflection<O, F, K> =>
  methodNames.reduce<Partial<Record<K, Function>>>((reflection, name) => {
    reflection[name] = object[name] ?? fallbacks[name] ?? noop;

    return reflection;
  }, {}) as Reflection<O, F, K>;

export default reflectMethods;
