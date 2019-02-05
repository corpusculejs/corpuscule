import {field, method as mmethod} from './descriptors';

export const method = ({key, method: value, supers}, constructor) => {
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
        return this.constructor === constructor ? value : supers[key];
      },
      key: $$key,
    }),
  ];
};
