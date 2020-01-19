import {Constructor, Initializer, Replace} from '@corpuscule/typings';

const $extendedFunction = new WeakMap<object, Function>();

export type ExtendableMethod = (this: any, ...args: any[]) => any;

const defineExtendable = <
  C extends object,
  B extends Record<PropertyKey, ExtendableMethod>
>(
  klass: Constructor<C, Partial<Replace<B, ExtendableMethod>>>,
  basicMethods: B,
  extendedMethods: Replace<B, ExtendableMethod>,
  initializers: Array<Initializer<C>>,
): void => {
  for (const key of Reflect.ownKeys(basicMethods) as ReadonlyArray<keyof B>) {
    klass.prototype[key] = function(this: C, ...args: any[]) {
      return $extendedFunction.get(this)!(...args);
    };

    initializers.push(self => {
      $extendedFunction.set(
        self,
        self.constructor !== klass ? extendedMethods[key] : basicMethods[key],
      );
    });
  }
};

export default defineExtendable;
