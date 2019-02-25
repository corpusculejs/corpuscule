import {assertKind, assertPlacement, Kind, Placement} from '@corpuscule/utils/lib/asserts';
import {hook} from '@corpuscule/utils/lib/descriptors';
import {getName} from '@corpuscule/utils/lib/propertyUtils';
import {apis} from './utils';

const createApiDecorator = ({value}, shared) => descriptor => {
  assertKind('api', Kind.Field | Kind.Accessor, descriptor);
  assertPlacement('api', Placement.Own | Placement.Prototype, descriptor);

  const {extras = [], key} = descriptor;
  const name = getName(key);

  if (!apis.includes(name)) {
    throw new TypeError(`Property name ${name} is not allowed`);
  }

  const finalDescriptor = {
    ...descriptor,
    extras: [
      hook({
        start() {
          shared[name].set(this, key);
        },
      }),
      ...extras,
    ],
  };

  return name === 'formApi' ? value(finalDescriptor) : finalDescriptor;
};

export default createApiDecorator;
