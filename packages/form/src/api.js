import {assertKind, assertPlacement, Kind, Placement} from '@corpuscule/utils/lib/asserts';
import {accessor, hook} from '@corpuscule/utils/lib/descriptors';
import {getName} from '@corpuscule/utils/lib/propertyUtils';
import {apis} from './utils';

const createApiDecorator = ({value}, shared, {ref}) => descriptor => {
  assertKind('api', Kind.Field | Kind.Accessor, descriptor);
  assertPlacement('api', Placement.Own | Placement.Prototype, descriptor);

  const {extras = [], key} = descriptor;
  const name = getName(key);

  if (!apis.includes(name)) {
    throw new TypeError(`Property name ${name} is not allowed`);
  }

  if (name === 'ref') {
    let $$ref;

    return accessor({
      finisher(target) {
        $$ref = ref.get(target);
      },
      get() {
        return this[$$ref];
      },
      key,
    });
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
