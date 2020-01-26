/* eslint-disable dot-notation */
import {isProvider, share} from '@corpuscule/context';
import {BabelPropertyDescriptor, CustomElement} from '@corpuscule/typings';
import makeAccessor from '@corpuscule/utils/lib/makeAccessor';
import {getName} from '@corpuscule/utils/lib/propertyUtils';
import shallowEqual from '@corpuscule/utils/lib/shallowEqual';
import {Token} from '@corpuscule/utils/lib/tokenRegistry';
import {noop} from '../../element/src/utils';
import {
  $$scheduleSubscription,
  FormFieldPrototype,
  FormOptions,
  OptionResponsibilityKey,
  optionResponsibilityKeys,
  SharedOptionProps,
  tokenRegistry,
} from './utils';

const option = (token: Token, responsibilityKey?: OptionResponsibilityKey) => <
  C extends CustomElement
>(
  {constructor: klass}: FormFieldPrototype<C>,
  key: PropertyKey,
  descriptor: BabelPropertyDescriptor,
) => {
  const finalResponsibilityKey =
    responsibilityKey ?? (getName(key) as OptionResponsibilityKey);

  if (!optionResponsibilityKeys.includes(finalResponsibilityKey)) {
    throw new TypeError(
      `"${finalResponsibilityKey}" is not one of the Final Form or Field configuration keys`,
    );
  }

  const sharedProps = tokenRegistry.get(token) as SharedOptionProps;
  sharedProps[finalResponsibilityKey].set(klass, key);

  if (descriptor.value) {
    return descriptor;
  }

  let setter: (self: any, v: any, originalGet?: () => unknown) => void;

  const {get, set} = makeAccessor(descriptor, klass.__initializers);

  // Executes after $formApi, $compareInitialValues and $scheduleSubscription are set.
  klass.__registrations.push(() => {
    if (isProvider(token, klass)) {
      const $formApi = share(token)!;

      setter =
        finalResponsibilityKey === 'initialValues'
          ? (
              self: C &
                Required<Pick<FormOptions, 'compareInitialValues'>> & {
                  ['key']: any;
                },
              initialValues: object,
            ) => {
              const compare = sharedProps.compareInitialValues.has(self)
                ? self[
                    sharedProps.compareInitialValues.get(
                      self,
                    ) as 'compareInitialValues'
                  ]
                : shallowEqual;
              if (!compare(self[key as 'key'], initialValues)) {
                $formApi.get(self)!.initialize(initialValues);
              }
            }
          : (self: C & {['key']: any}, v: unknown) => {
              if (self[key as 'key'] !== v) {
                $formApi.get(self)!.setConfig(finalResponsibilityKey, v);
              }
            };
    } else {
      const scheduleSubscription = $$scheduleSubscription.get(klass)!;

      const areEqual =
        finalResponsibilityKey === 'subscription'
          ? (v: unknown, oldValue: unknown) => shallowEqual(v, oldValue)
          : (v: unknown, oldValue: unknown) => v === oldValue;

      setter =
        finalResponsibilityKey === 'name' ||
        finalResponsibilityKey === 'subscription'
          ? (self: C, v: unknown, originalGet: (this: C) => unknown) => {
              if (!areEqual(v, originalGet.call(self))) {
                scheduleSubscription(self);
              }
            }
          : noop;
    }
  });

  return {
    configurable: true,
    get,
    set(v: unknown) {
      setter(this, v, get);
      set.call(this, v);
    },
  };
};

export default option;
