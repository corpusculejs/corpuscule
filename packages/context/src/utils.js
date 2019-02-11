import {lifecycleKeys} from '@corpuscule/utils/lib/descriptors';

// eslint-disable-next-line no-empty-function
export const noop = () => {};

export const filter = elements =>
  elements.filter(
    ({key, placement}) => !(lifecycleKeys.includes(key) && placement === 'prototype'),
  );
