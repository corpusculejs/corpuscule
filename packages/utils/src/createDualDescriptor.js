import {field} from './descriptors';

const createDualDescriptor = (descriptor, initializer) => {
  if (descriptor.get && descriptor.set) {
    return [descriptor];
  }

  const storage = Symbol();

  return [
    {
      get() {
        return this[storage];
      },
      set(value) {
        this[storage] = value;
      },
    },
    field({
      initializer,
      key: storage,
    }, {isPrivate: true}),
  ];
};

export default createDualDescriptor;
