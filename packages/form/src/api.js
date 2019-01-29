import {assertKind, assertPlacement} from '@corpuscule/utils/lib/asserts';
import * as $ from '@corpuscule/utils/lib/descriptors';
import {getName} from '@corpuscule/utils/lib/propertyUtils';
import {apis} from './utils';

const createAnotherApi = (descriptor, shared) => {
  const {
    descriptor: {get, set},
    key,
    kind,
    placement,
  } = descriptor;

  assertKind('api', 'fields or full accessors', kind, {
    correct: kind === 'field' || (kind === 'method' && (get && set)),
  });
  assertPlacement('api', 'own', placement);

  return {
    ...descriptor,
    extras: [
      $.hook({
        start() {
          shared[getName(key)].set(this, key);
        },
      }),
    ],
  };
};

const createApiDecorator = ({value}, {api}, {input, meta}, {state}) => descriptor => {
  const {key} = descriptor;
  const name = getName(key);

  const isFormApi = name === 'form';

  if (!apis.includes(name) && !isFormApi) {
    throw new TypeError(
      '@api applicable only to public/symbolic/private properties named "form", "state",' +
        ' "input" or "meta"',
    );
  }

  if (!isFormApi) {
    return createAnotherApi(descriptor, {input, meta, state});
  }

  return {
    ...value(descriptor),
    extras: [
      $.hook({
        start() {
          api.set(this, key);
        },
      }),
    ],
  };
};

export default createApiDecorator;
