import {isProvider} from '@corpuscule/context';
import makeAccessor from '@corpuscule/utils/lib/makeAccessor';
import {getName} from '@corpuscule/utils/lib/propertyUtils';
import {setObject} from '@corpuscule/utils/lib/setters';
import shallowEqual from '@corpuscule/utils/lib/shallowEqual';
import {noop} from '../../element/src/utils';
import {fieldOptions, formOptions, tokenRegistry} from './utils';

const optionsList = new Set([...fieldOptions, ...formOptions]);

const option = (token, name) => ({constructor: target}, key, descriptor) => {
  const optionName = name || getName(key);
  const [sharedPropertiesRegistry, formOptionsRegistry] = tokenRegistry.get(token);

  if (!optionsList.has(optionName)) {
    throw new TypeError(`"${optionName}" is not one of the Final Form or Field configuration keys`);
  }

  const isCompareInitialValues = optionName === 'compareInitialValues';
  if (isCompareInitialValues) {
    setObject(sharedPropertiesRegistry, target, {
      compare: key,
    });
  } else {
    // Executes after the distinction between providers and consumers is defined.
    target.__registrations.push(() => {
      setObject(
        isProvider(token, target) ? formOptionsRegistry : sharedPropertiesRegistry,
        target,
        {[optionName]: key},
      );
    });
  }

  if ('initializer' in descriptor || ('get' in descriptor && 'set' in descriptor)) {
    let setter;

    const {get, set} = makeAccessor(descriptor, target.__initializers);

    // Executes after $formApi, $compareInitialValues and $scheduleSubscription are set.
    target.__registrations.push(() => {
      if (isProvider(token, target)) {
        const {formApi: $formApi, compare: $compareInitialValues} = sharedPropertiesRegistry.get(
          target,
        );

        setter =
          optionName === 'initialValues'
            ? (self, initialValues) => {
                if (
                  !(($compareInitialValues && self[$compareInitialValues]) || shallowEqual).call(
                    self,
                    self[key],
                    initialValues,
                  )
                ) {
                  self[$formApi].initialize(initialValues);
                }
              }
            : (self, v) => {
                if (self[key] !== v) {
                  self[$formApi].setConfig(optionName, v);
                }
              };
      } else {
        const {schedule: $scheduleSubscription} = sharedPropertiesRegistry.get(target);

        const areEqual =
          optionName === 'subscription'
            ? (v, oldValue) => shallowEqual(v, oldValue)
            : (v, oldValue) => v === oldValue;

        setter =
          optionName === 'name' || optionName === 'subscription'
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

  target.__initializers.push(self => {
    self[key] = descriptor.value.bind(self);
  });

  return descriptor;
};

export default option;
