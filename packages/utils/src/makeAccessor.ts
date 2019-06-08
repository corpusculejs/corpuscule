/**
 * Converts the regular property to an accessor and registers the initializer
 * to set the initial value. If the received descriptor already belongs to an
 * accessor, it will be returned as is.
 *
 * @param descriptor a property or an accessor descriptor.
 *
 * @param initializers an array of functions to register the initial value
 * initializer.
 */
const makeAccessor = (
  descriptor: PropertyDescriptor & {initializer?: () => unknown},
  initializers: Array<(self: object) => void>,
): Required<Pick<PropertyDescriptor, 'get' | 'set'>> & Omit<PropertyDescriptor, 'get' | 'set'> => {
  const {get, initializer, set} = descriptor;

  if (get && set) {
    return descriptor as Required<PropertyDescriptor>;
  }

  const storage = Symbol();

  initializers.push(self => {
    self[storage] = initializer ? initializer.call(self) : undefined;
  });

  return {
    get(this: any): any {
      return this[storage];
    },
    set(this: any, value: any): void {
      this[storage] = value;
    },
  };
};

export default makeAccessor;
