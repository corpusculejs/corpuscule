import {BabelPropertyDescriptor, Initializer} from '@corpuscule/typings';

export type NewAccessor = Required<Pick<PropertyDescriptor, 'get' | 'set'>> &
  Omit<PropertyDescriptor, 'get' | 'set'>;

const $$storage = new WeakMap<object, unknown>();

const makeAccessor = (
  descriptor: BabelPropertyDescriptor,
  initializers: Initializer[],
): NewAccessor => {
  const {get, initializer, set} = descriptor;

  if (get && set) {
    return descriptor as NewAccessor;
  }

  initializers.push(self => {
    $$storage.set(self, initializer ? initializer.call(self) : undefined);
  });

  return {
    get(this: object) {
      return $$storage.get(this);
    },
    set(this: object, value: unknown) {
      $$storage.set(this, value);
    },
  };
};

export default makeAccessor;
