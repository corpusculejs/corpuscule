import {lifecycleKeys} from '@corpuscule/utils/lib/descriptors';

export const checkValue = (value, target) => {
  if (!value.has(target)) {
    throw new Error(`No ${target.name} field is marked with @value`);
  }
};

export const filter = elements =>
  elements.filter(
    ({key, placement}) => !(lifecycleKeys.includes(key) && placement === 'prototype'),
  );
