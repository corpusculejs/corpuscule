import {BabelPropertyDescriptor, Initializer} from '@corpuscule/typings';

export type NewAccessor = Required<Pick<PropertyDescriptor, 'get' | 'set'>> &
  Omit<PropertyDescriptor, 'get' | 'set'>;

const makeAccessor = (
  descriptor: BabelPropertyDescriptor,
  initializers: Initializer[],
): NewAccessor => {
  const {get, initializer, set} = descriptor;

  if (get && set) {
    return descriptor as NewAccessor;
  }

  const storage = Symbol();

  initializers.push((self: any) => {
    self[storage] = initializer ? initializer.call(self) : undefined;
  });

  return {
    get(this: any) {
      return this[storage];
    },
    set(this: any, value: any) {
      this[storage] = value;
    },
  };
};

export default makeAccessor;
