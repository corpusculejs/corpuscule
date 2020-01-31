import {Constructor, Initializer, Replace} from '@corpuscule/typings';

export type ExtendableMethod = (this: any, ...args: any[]) => any;

const defineExtendable = <
  C extends object,
  B extends Record<PropertyKey, ExtendableMethod>
>(
  klass: Constructor<C, Partial<Replace<B, ExtendableMethod>>>,
  basicMethods: B,
  extendedMethods: Replace<B, ExtendableMethod>,
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
