import {assertKind, assertPlacement, Kind, Placement} from '@corpuscule/utils/lib/asserts';
import {getName, getValue} from '@corpuscule/utils/lib/propertyUtils';
import shallowEqual from '@corpuscule/utils/lib/shallowEqual';
import {accessor, hook, method} from '@corpuscule/utils/lib/descriptors';
import {noop} from '../../element/src/utils';
import {fieldOptions, formOptions} from './utils';

const optionsList = new Set([...fieldOptions, ...formOptions]);

const createOptionDecorator = (
  {isProvider: isForm},
  {formApi},
  options,
  {compare, configOptions, subscribe, update},
) => descriptor => {
  assertKind('option', Kind.Field | Kind.Method | Kind.Accessor, descriptor);
  assertPlacement('option', Placement.Own | Placement.Prototype, descriptor);

  const {
    descriptor: d,
    extras = [],
    finisher: originalFinisher = noop,
    initializer,
    key,
    kind,
    placement,
  } = descriptor;
  const {get, set, value} = d;

  const name = getName(key);

  if (!optionsList.has(name)) {
    throw new TypeError(`"${name}" is not one of the Final Form or Field configuration keys`);
  }

  const isCompareInitialValues = name === 'compareInitialValues';

  const finisher = isCompareInitialValues
    ? originalFinisher
    : target => {
        originalFinisher(target);

        // There are different behavior for @form and @field finishers
        if (isForm(target)) {
          configOptions.get(target).push(key);
        } else {
          options[name].set(target, key);
        }
      };

  if (kind === 'method' && value) {
    return {
      descriptor: d,
      extras: isCompareInitialValues
        ? [
            hook({
              start() {
                compare.set(this, key);
              },
            }),
            ...extras,
          ]
        : [
            method({
              bound: true,
              key,
              method: value,
            }),
            ...extras,
          ],
      finisher,
      key,
      kind,
      placement,
    };
  }

  // @field properties
  let $subscribe;
  let $update;

  // @form properties
  let $compareInitialValues;
  let $formApi;
  let setter;

  return accessor({
    adjust: ({get: originalGet, set: originalSet}) => ({
      get: originalGet,
      set(v) {
        setter(this, v, originalGet);
        originalSet.call(this, v);
      },
    }),
    extras,
    finisher(target) {
      finisher(target);

      if (isForm(target)) {
        $formApi = formApi.get(target);
        $compareInitialValues = compare.get(target);

        setter =
          name === 'initialValues'
            ? (self, initialValues) => {
                if (
                  !(
                    ($compareInitialValues && getValue(self, $compareInitialValues)) ||
                    shallowEqual
                  ).call(self, getValue(self, key), initialValues)
                ) {
                  getValue(self, $formApi).initialize(initialValues);
                }
              }
            : (self, v) => {
                if (self[key] !== v) {
                  getValue(self, $formApi).setConfig(name, v);
                }
              };
      } else {
        $subscribe = subscribe.get(target);
        $update = update.get(target);

        const areEqual =
          name === 'subscription'
            ? (v, oldValue) => shallowEqual(v, oldValue)
            : (v, oldValue) => v === oldValue;

        const runUpdate =
          name === 'name' || name === 'subscription'
            ? self => self[$subscribe]()
            : self => self[$update]();

        setter = (self, v, originalGet) => {
          if (!areEqual(v, originalGet.call(self))) {
            runUpdate(self);
          }
        };
      }
    },
    get,
    initializer,
    key,
    set,
  });
};

export default createOptionDecorator;
