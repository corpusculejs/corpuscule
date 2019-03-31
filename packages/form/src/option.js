import {isProvider} from '@corpuscule/context';
import define, {defaultDescriptor} from '@corpuscule/utils/lib/define';
import {makeAccessor} from '@corpuscule/utils/lib/descriptorsNew';
import {getName} from '@corpuscule/utils/lib/propertyUtils';
import {setArray, setObject} from '@corpuscule/utils/lib/setters';
import shallowEqual from '@corpuscule/utils/lib/shallowEqual';
import {noop} from '../../element/src/utils';
import {fieldOptions, formOptions, tokenRegistry} from './utils';

const optionsList = new Set([...fieldOptions, ...formOptions]);

const option = token => ({constructor: target}, key, descriptor) => {
  const name = getName(key);
  const [sharedPropertiesRegistry, formOptionsRegistry] = tokenRegistry.get(token);

  if (!optionsList.has(name)) {
    throw new TypeError(`"${name}" is not one of the Final Form or Field configuration keys`);
  }

  const isCompareInitialValues = name === 'compareInitialValues';
  if (isCompareInitialValues) {
    setObject(sharedPropertiesRegistry, target, {
      compare: key,
    });
  } else {
    // Executes after the distinction between providers and consumers are set.
    target.__registrations.push(() => {
      if (isProvider(token, target)) {
        setArray(formOptionsRegistry, target, key);
      } else {
        setObject(sharedPropertiesRegistry, target, {
          [name]: key,
        });
      }
    });
  }

  if ('initializer' in descriptor || ('get' in descriptor && 'set' in descriptor)) {
    let setter;

    const {get, set} = makeAccessor(target, descriptor);

    // Executes after $formApi, $compareInitialValues and $scheduleSubscription are set.
    target.__registrations.push(() => {
      if (isProvider(token, target)) {
        const {formApi: $formApi, compare: $compareInitialValues} = sharedPropertiesRegistry.get(
          target,
        );

        setter =
          name === 'initialValues'
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
                  self[$formApi].setConfig(name, v);
                }
              };
      } else {
        const {schedule: $scheduleSubscription} = sharedPropertiesRegistry.get(target);

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
      ...defaultDescriptor,
      get,
      set(v) {
        setter(this, v, get);
        set.call(this, v);
      },
    };
  }

  target.__initializers.push(self => {
    define(self, {
      [key]: descriptor.value.bind(self),
    });
  });

  return descriptor;
};

export default option;
