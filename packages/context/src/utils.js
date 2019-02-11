import {lifecycleKeys} from '@corpuscule/utils/lib/descriptors';

export const filter = elements =>
  elements.filter(
    ({key, placement}) => !(lifecycleKeys.includes(key) && placement === 'prototype'),
  );
