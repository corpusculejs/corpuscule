import {assertKind, assertPlacement, Kind, Placement} from '@corpuscule/utils/lib/asserts';
import {accessor} from '@corpuscule/utils/lib/descriptors';

export const createUnitDecorator = ({units}) => getter => descriptor => {
  assertKind('unit', Kind.Field | Kind.Accessor, descriptor);
  assertPlacement('unit', Placement.Own | Placement.Prototype, descriptor);

  const {key} = descriptor;

  return accessor({
    ...descriptor,
    finisher(target) {
      units.get(target).set(key, getter);
    },
  });
};
