import {Constructor, Initializer} from '@corpuscule/typings';

const defineExtendable = <
  Class extends object,
  PropertyName extends PropertyKey
>(
  klass: Constructor<Class>,
  baseClassMethods: Record<PropertyName, Function>,
  extendedClassMethods: Record<PropertyName, Function>,
  initializers: Initializer[],
): void => {
  for (const key of Reflect.ownKeys(baseClassMethods) as PropertyName[]) {
    const selfKey = Symbol();

    klass.prototype[key] = function(
      this: Class & {[selfKey]: Function},
      ...args: any[]
    ) {
      this[selfKey](...args);
    };

    initializers.push((self: Class & {[selfKey]: Function}) => {
      self[selfKey] =
        self.constructor !== klass
          ? extendedClassMethods[key]
          : baseClassMethods[key];
    });
  }
};

export default defineExtendable;
