import {assertKind, assertPlacement, Kind, Placement} from '@corpuscule/utils/lib/asserts';
import {hook} from '@corpuscule/utils/lib/descriptors';
import {getName} from '@corpuscule/utils/lib/propertyUtils';

const createApiDecorator = ({value}, shared) => descriptor => {
  assertKind('api', Kind.Field | Kind.Method | Kind.Accessor, descriptor);
  assertPlacement('api', Placement.Own | Placement.Prototype, descriptor);

  const {key} = descriptor;
  const name = getName(key);

  if (name === 'layout' || name === 'route') {
    return {
      ...descriptor,
      extras: [
        hook({
          start() {
            shared[name].set(this, key);
          },
        }),
      ],
    };
  }

  return value(descriptor);
};

export default createApiDecorator;
