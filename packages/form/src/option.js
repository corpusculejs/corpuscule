import {isProvider} from '@corpuscule/context';
import makeAccessor from '@corpuscule/utils/lib/makeAccessor';
import {getName} from '@corpuscule/utils/lib/propertyUtils';
import {setArray, setObject} from '@corpuscule/utils/lib/setters';
import shallowEqual from '@corpuscule/utils/lib/shallowEqual';
import {noop} from '../../element/src/utils';
import {fieldOptions, formOptions, tokenRegistry} from './utils';

const optionsList = new Set([...fieldOptions, ...formOptions]);

const option = token => ({constructor: klass}, propertyKey, descriptor) => {
  const name = getName(propertyKey);
  const [sharedPropertiesRegistry, formOptionsRegistry] = tokenRegistry.get(token);

  if (!optionsList.has(name)) {
    throw new TypeError(`"${name}" is not one of the Final Form or Field configuration keys`);
  }

  const isCompareInitialValues = name === 'compareInitialValues';
  if (isCompareInitialValues) {
    setObject(sharedPropertiesRegistry, klass, {
      compare: propertyKey,
    });
  } else {
    // Executes after the distinction between providers and consumers are set.
    klass.__registrations.push(() => {
      if (isProvider(token, klass)) {
        setArray(formOptionsRegistry, klass, [propertyKey]);
      } else {
        setObject(sharedPropertiesRegistry, klass, {
          [name]: propertyKey,
        });
      }
    });
  }

  if ('initializer' in descriptor || ('get' in descriptor && 'set' in descriptor)) {
    let setter;

    const {get, set} = makeAccessor(descriptor, klass.__initializers);

    // Executes after $formApi, $compareInitialValues and $scheduleSubscription are set.
    klass.__registrations.push(() => {
      if (isProvider(token, klass)) {
        const {formApi: $formApi, compare: $compareInitialValues} = sharedPropertiesRegistry.get(
          klass,
        );

        setter =
          name === 'initialValues'
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
                  self[$formApi].setConfig(name, v);
                }
              };
      } else {
        const {schedule: $scheduleSubscription} = sharedPropertiesRegistry.get(klass);

        const areEqual =
          name === 'subscription'
            ? (v, oldValue) => shallowEqual(v, oldValue)
            : (v, oldValue) => v === oldValue;

        setter =
          name === 'name' || name === 'subscription'
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
