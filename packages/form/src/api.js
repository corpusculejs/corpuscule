import {assertKind, assertPlacement, Kind, Placement} from '@corpuscule/utils/lib/asserts';
import {hook} from '@corpuscule/utils/lib/descriptors';
import {getName} from '@corpuscule/utils/lib/propertyUtils';
import {apis} from './utils';

const createApiDecorator = ({value}, shared) => name => descriptor => {
  assertKind('api', Kind.Field | Kind.Accessor, descriptor);
  assertPlacement('api', Placement.Own | Placement.Prototype, descriptor);

  const {extras = [], key} = descriptor;
  const apiName = name || getName(key);

  if (!apis.includes(apiName)) {
    throw new TypeError(`Property name ${apiName} is not allowed`);
  }

  const finalDescriptor = {
    ...descriptor,
    extras: [
      hook({
        start() {
          shared[apiName].set(this, key);
        },
      }),
      ...extras,
    ],
  };

  return apiName === 'form' ? value(finalDescriptor) : finalDescriptor;
};

export default createApiDecorator;
