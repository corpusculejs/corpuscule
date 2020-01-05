import {Constructor, Exact, Initializer} from '@corpuscule/typings';

export type BasicMethod = (this: any, ...args: any[]) => any;

const defineExtendable = <
  C,
  B extends Record<PropertyKey, BasicMethod>,
  E extends B
>(
  klass: Constructor<C, Partial<B>>,
  basicMethods: B,
  extendedMethods: Exact<E, B>,
  initializers: Initializer[],
): void => {
  for (const key of Reflect.ownKeys(basicMethods) as ReadonlyArray<keyof B>) {
    const selfKey = Symbol();

    klass.prototype[key] = function(
      this: C & {
        [selfKey]: Function;
      },
      ...args: any[]
    ) {
      return this[selfKey](...args);
    } as B[keyof B];

    initializers.push((self: C & {[selfKey]: Function}) => {
      self[selfKey] =
        self.constructor !== klass ? extendedMethods[key] : basicMethods[key];
    });
  }
};

export default defineExtendable;
