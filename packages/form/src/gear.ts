import {share} from '@corpuscule/context';
import {BabelPropertyDescriptor, CustomElement} from '@corpuscule/typings';
import {getName} from '@corpuscule/utils/lib/propertyUtils';
import {Token} from '@corpuscule/utils/lib/tokenRegistry';
import {FormApi} from 'final-form';
import {
  FormFieldPrototype,
  GearResponsibilityKey,
  gearResponsibilityKeys,
  SharedGearProps,
  tokenRegistry,
} from './utils';

const gear = (
  token: Token,
  responsibilityKey?: GearResponsibilityKey,
): PropertyDecorator =>
  (<C extends CustomElement, P extends PropertyKey>(
    {constructor: klass}: FormFieldPrototype<C & Record<P, any>>,
    key: P,
    descriptor: BabelPropertyDescriptor,
  ) => {
    const finalResponsibilityKey =
      responsibilityKey ?? (getName(key) as GearResponsibilityKey);

    if (!gearResponsibilityKeys.includes(finalResponsibilityKey)) {
      throw new TypeError(
        `Property name ${finalResponsibilityKey} is not allowed`,
      );
    }

    const sharedProps = tokenRegistry.get(token) as SharedGearProps;

    if (finalResponsibilityKey === 'refs') {
      const {refs: $refs} = sharedProps;

      return {
        configurable: true,
        get(this: C): unknown | undefined {
          return $refs.get(this);
        },
      };
    }

    if (finalResponsibilityKey === 'formApi') {
      const $formApi: WeakMap<C, FormApi> = share(token)!;

      return {
        configurable: true,
        get(this: C): unknown | undefined {
          return $formApi.get(this);
        },
      };
    } else if (descriptor.value) {
      sharedProps[finalResponsibilityKey].set(klass, descriptor.value);
    }

    klass.__initializers.push(self => {
      sharedProps[finalResponsibilityKey].set(self, self[key]);
    });

    return descriptor;
  }) as any;

export default gear;
