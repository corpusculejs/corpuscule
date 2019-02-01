import {assertKind, assertPlacement, Kind, Placement} from '@corpuscule/utils/lib/asserts';
import {method} from '@corpuscule/utils/lib/descriptors';
import {getValue} from '@corpuscule/utils/lib/propertyUtils';

export const createDispatcherDecorator = ({store}) => descriptor => {
  assertKind('dispatcher', Kind.Field | Kind.Method, descriptor);
  assertPlacement('dispatcher', Placement.Own | Placement.Prototype, descriptor);

  const {
    descriptor: {value},
    initializer,
    key,
    kind,
  } = descriptor;

  let $store;

  const finisher = target => {
    $store = store.get(target);
  };

  if (kind === 'field') {
    const actionCreator = initializer && initializer();

    if (!actionCreator || typeof actionCreator !== 'function') {
      throw new TypeError(`@dispatcher "${key}" should be initialized with a function`);
    }

    return method({
      finisher,
      key,
      method(...args) {
        getValue(this, $store).dispatch(actionCreator(...args));
      },
      placement: 'own',
    });
  }

  return {
    ...descriptor,
    extras: [
      method({
        key,
        method(...args) {
          getValue(this, $store).dispatch(value.apply(this, args));
        },
        placement: 'own',
      }),
    ],
    finisher,
  };
};
