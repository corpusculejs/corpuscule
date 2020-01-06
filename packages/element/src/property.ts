import {BabelPropertyDescriptor, CustomElement} from '@corpuscule/typings';
import makeAccessor from '@corpuscule/utils/lib/makeAccessor';
import {propertyChangedCallback as $propertyChangedCallback} from './tokens';
import {ElementGears, ElementPrototype, PropertyGuard} from './utils';

const property = (guard: PropertyGuard = () => true): PropertyDecorator =>
  (<C extends CustomElement>(
    {constructor: klass}: ElementPrototype<C>,
    key: PropertyKey,
    descriptor: BabelPropertyDescriptor,
  ) => {
    const {get, set} = makeAccessor(descriptor, klass.__initializers);

    return {
      configurable: true,
      get,
      set(this: C & Required<ElementGears>, value: unknown) {
        if (!guard(value)) {
          throw new TypeError(
            `Value applied to "${String(key)}" has wrong type`,
          );
        }

        const oldValue = get.call(this);
        set.call(this, value);
        this[$propertyChangedCallback](key, oldValue, value);
      },
    };
  }) as any;

export default property;
