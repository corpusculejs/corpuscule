import {assertKind, assertPlacement, Kind, Placement} from '@corpuscule/utils/lib/asserts';
import {hook} from '@corpuscule/utils/lib/descriptors';
import {getName} from '@corpuscule/utils/lib/propertyUtils';
import {apis} from './utils';

const createApiDecorator = ({value}, {api}, {input, meta}, {state}) => descriptor => {
  assertKind('api', Kind.Field | Kind.Accessor, descriptor);
  assertPlacement('api', Placement.Own | Placement.Prototype, descriptor);

  const {extras = [], key} = descriptor;
  const name = getName(key);

  const isFormApi = name === 'form';

  if (!apis.includes(name) && !isFormApi) {
    throw new TypeError(`Property name ${name} is not allowed`);
  }

  const finalDescriptor = {
    ...descriptor,
    extras: [
      hook({
        start() {
          if (isFormApi) {
            api.set(this, key);
          } else {
            const shared = name === 'input' ? input : name === 'meta' ? meta : state;
            shared.set(this, key);
          }
        },
      }),
      ...extras,
    ],
  };

  return isFormApi ? value(finalDescriptor) : finalDescriptor;
};

export default createApiDecorator;
