import {assertKind, assertPlacement, Kind, Placement} from '@corpuscule/utils/lib/asserts';
import {accessor} from '@corpuscule/utils/lib/descriptors';
import {noop} from './utils';

const createQuery = (name, callback) => selector => descriptor => {
  assertKind(name, Kind.Field, descriptor);
  assertPlacement(name, Placement.Own, descriptor);

  const {extras, finisher = noop, key} = descriptor;

  return accessor({
    extras,
    finisher,
    get() {
      return callback(this.shadowRoot || this, selector);
    },
    key,
  });
};

export const query = createQuery('query', (target, selector) => target.querySelector(selector));
export const queryAll = createQuery('queryAll', (target, selector) =>
  target.querySelectorAll(selector),
);
