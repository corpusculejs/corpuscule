import {isProvider} from '@corpuscule/context';
import makeAccessor from '@corpuscule/utils/lib/makeAccessor';
import {getName} from '@corpuscule/utils/lib/propertyUtils';
import {setObject} from '@corpuscule/utils/lib/setters';
import shallowEqual from '@corpuscule/utils/lib/shallowEqual';
import {noop} from '../../element/src/utils';
import {fieldOptionResponsibilityKeys, formOptionResponsibilityKeys, tokenRegistry} from './utils';

const optionsResponsibilityKeys = new Set([
  ...fieldOptionResponsibilityKeys,
  ...formOptionResponsibilityKeys,
]);

const option = (token, responsibilityKey) => ({constructor: klass}, propertyKey, descriptor) => {
  const finalResponsibilityKey = responsibilityKey || getName(propertyKey);
  const sharedPropertiesRegistry = tokenRegistry.get(token);

  if (!optionsResponsibilityKeys.has(finalResponsibilityKey)) {
    throw new TypeError(
      `"${finalResponsibilityKey}" is not one of the Final Form or Field configuration keys`,
    );
  }

  setObject(sharedPropertiesRegistry, klass, {
    [finalResponsibilityKey]: propertyKey,
  });

  if ('initializer' in descriptor || ('get' in descriptor && 'set' in descriptor)) {
    let setter;

    const {get, set} = makeAccessor(descriptor, klass.__initializers);

    // Executes after $formApi, $compareInitialValues and $scheduleSubscription are set.
    klass.__registrations.push(() => {
      if (isProvider(token, klass)) {
        const {
          formApi: $formApi,
          compareInitialValues: $compareInitialValues,
        } = sharedPropertiesRegistry.get(klass);

        setter =
          finalResponsibilityKey === 'initialValues'
            ? (self, initialValues) => {
                if (
                  !(($compareInitialValues && self[$compareInitialValues]) || shallowEqual).call(
                    self,
                    self[propertyKey],
                    initialValues,
                  )
                ) {
                  self[$formApi].initialize(initialValues);
                }
              }
            : (self, v) => {
                if (self[propertyKey] !== v) {
                  self[$formApi].setConfig(finalResponsibilityKey, v);
                }
              };
      } else {
        const {schedule: $scheduleSubscription} = sharedPropertiesRegistry.get(klass);

        const areEqual =
          finalResponsibilityKey === 'subscription'
            ? (v, oldValue) => shallowEqual(v, oldValue)
            : (v, oldValue) => v === oldValue;

        setter =
          finalResponsibilityKey === 'name' || finalResponsibilityKey === 'subscription'
            ? (self, v, originalGet) => {
                if (!areEqual(v, originalGet.call(self))) {
                  self[$scheduleSubscription]();
                }
              }
            : noop;
      }
    });

    return {
      configurable: true,
      get,
      set(v) {
        setter(this, v, get);
        set.call(this, v);
      },
    };
  }

  klass.__initializers.push(self => {
    self[propertyKey] = descriptor.value.bind(self);
  });

  return descriptor;
};

export default option;
