import {field, method as mmethod} from './descriptors';

export const method = ({key, method: value}, supers, getConstructor) => {
  const $$key = Symbol();

  return [
    mmethod({
      key,
      method(...args) {
        this[$$key](...args);
      },
    }),
    field({
      initializer() {
        return this.constructor === getConstructor() ? value : supers[key];
      },
      key: $$key,
    }),
  ];
};
