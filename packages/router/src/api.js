import {assertKind, assertPlacement} from '@corpuscule/utils/lib/asserts';
import {hook} from '@corpuscule/utils/lib/descriptors';
import {getName} from '@corpuscule/utils/lib/propertyUtils';

const createApiDecorator = ({value}, {api}) => descriptor => {
  const {
    descriptor: {get, set},
    key,
    kind,
    placement,
  } = descriptor;

  assertKind('api', 'properties, methods or full accessors', kind, {
    correct: kind === 'field' || (kind === 'method' && (value || (get && set))),
  });
  assertPlacement('api', 'own or prototype', placement, {
    correct: placement === 'own' || placement === 'prototype',
  });

  if (getName(key) === 'layout') {
    return {
      ...descriptor,
      extras: [
        hook({
          start() {
            api.set(this, key);
          },
        }),
      ],
    };
  }

  return value(descriptor);
};

export default createApiDecorator;
