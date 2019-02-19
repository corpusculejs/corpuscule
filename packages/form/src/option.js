import {assertKind, assertPlacement, Kind, Placement} from '@corpuscule/utils/lib/asserts';
import {getName, getValue} from '@corpuscule/utils/lib/propertyUtils';
import shallowEqual from '@corpuscule/utils/lib/shallowEqual';
import {accessor, hook, method} from '@corpuscule/utils/lib/descriptors';
import {noop} from '../../element/src/utils';
import {fieldOptions, formOptions} from './utils';

const createOptionDecorator = (
  {form: formApi},
  options,
  {subscribe, update},
  {compare, configInitializers},
) => name => descriptor => {
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

  const finalName = name || getName(key);

  if (finalName === 'compareInitialValues') {
    return {
      ...descriptor,
      extras: [
        hook({
          start() {
            compare.set(this, key);
          },
        }),
        ...extras,
      ],
      finisher: originalFinisher,
    };
  }

  const isForm = formOptions.includes(finalName);
  const isField = fieldOptions.includes(finalName);

  if (!isForm && !isField) {
    throw new TypeError(`"${finalName}" is not one of the Final Form or Field configuration keys`);
  }

  let methodPart;
  let accessorPart;

  if (isField) {
    let $subscribe;
    let $update;

    const finisher = target => {
      originalFinisher(target);
      options[finalName].set(target, key);
      $subscribe = subscribe.get(target);
      $update = update.get(target);
    };

    methodPart = {
      extras: [
        method({
          bound: true,
          key,
          method: value,
        }),
      ],
      finisher,
    };

    accessorPart = {
      adjust({get: originalGet, set: originalSet}) {
        return {
          get: originalGet,
          set:
            finalName === 'name' || finalName === 'subscription'
              ? function(v) {
                  const oldValue = originalGet.call(this);
                  originalSet.call(this, v);

                  if (finalName === 'name' ? v !== oldValue : !shallowEqual(v, oldValue)) {
                    this[$subscribe]();
                  }
                }
              : function(v) {
                  if (v !== originalGet.call(this)) {
                    this[$update]();
                  }

                  originalSet.call(this, v);
                },
        };
      },
      finisher,
    };
  } else {
    methodPart = {
      finisher(target) {
        originalFinisher(target);
        configInitializers.get(target).push([
          key,
          function() {
            return value.bind(this);
          },
        ]);
      },
    };

    let $compareInitialValues;
    let $formApi;

    const updateForm =
      finalName === 'initialValues'
        ? function(initialValues) {
            if (
              !(
                ($compareInitialValues && getValue(this, $compareInitialValues)) ||
                shallowEqual
              ).call(this, getValue(this, key), initialValues)
            ) {
              getValue(this, $formApi).initialize(initialValues);
            }
          }
        : function(v) {
            if (this[key] !== v) {
              getValue(this, $formApi).setConfig(finalName, v);
            }
          };

    accessorPart = {
      adjust({get: originGet, set: originSet}) {
        return {
          get: originGet,
          set(v) {
            updateForm.call(this, v);
            originSet.call(this, v);
          },
        };
      },
      finisher(target) {
        originalFinisher(target);
        $formApi = formApi.get(target);
        $compareInitialValues = compare.get(target);

        configInitializers.get(target).push([
          key,
          get
            ? function() {
                return get.call(this);
              }
            : initializer,
        ]);
      },
    };
  }

  if (kind === 'method' && value) {
    return {
      descriptor: d,
      key,
      kind,
      placement,
      ...methodPart,
    };
  }

  return accessor({
    get,
    initializer,
    key,
    set,
    ...accessorPart,
  });
};

export default createOptionDecorator;
