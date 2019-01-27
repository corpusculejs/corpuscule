import {assertKind, assertPlacement} from '@corpuscule/utils/lib/asserts';
import {getName, getValue} from '@corpuscule/utils/lib/propertyUtils';
import shallowEqual from '@corpuscule/utils/lib/shallowEqual';
import * as $ from '@corpuscule/utils/lib/descriptors';
import {fieldOptions, formOptions} from './utils';

const createOptionDecorator = (
  {api},
  {options, subscribe, update},
  {compare, configInitializers},
) => propertyDescriptor => {
  const {descriptor, initializer, key, kind, placement} = propertyDescriptor;
  const {get, set, value} = descriptor;

  assertKind('formOption', 'properties, methods or full accessors', kind, {
    correct: kind === 'field' || (kind === 'method' && (value || (get && set))),
  });
  assertPlacement('formOption', 'own or prototype', placement, {
    correct: placement === 'own' || placement === 'prototype',
  });

  const name = getName(key);

  if (name === 'compareInitialValues') {
    return {
      ...descriptor,
      extras: [
        $.hook({
          start() {
            compare.set(this, key);
          },
        }),
      ],
    };
  }

  const isForm = formOptions.includes(name);
  const isField = fieldOptions.includes(name);

  if (!isForm && !isField) {
    throw new TypeError(`"${name}" is not one of the Final Form or Field configuration keys`);
  }

  let methodPart;
  let accessorPart;

  if (isField) {
    let $subscribe;
    let $update;

    const finisher = target => {
      options[name].set(target, key);
      $subscribe = subscribe.get(target);
      $update = update.get(target);
    };

    methodPart = {
      extras: [
        $.method({
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
            name === 'name' || name === 'subscription'
              ? function(v) {
                  const oldValue = originalGet.call(this);
                  originalSet.call(this, v);

                  if (name === 'name' ? v !== oldValue : !shallowEqual(v, oldValue)) {
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
        configInitializers.get(target).push([
          key,
          function() {
            return value.bind(this);
          },
        ]);
      },
    };

    let $compareInitialValues;
    let $api;

    const updateForm =
      name === 'initialValues'
        ? function(initialValues) {
            if (
              !(getValue(this, $compareInitialValues) || shallowEqual).call(
                this,
                getValue(this, key),
                initialValues,
              )
            ) {
              getValue(this, $api).initialize(initialValues);
            }
          }
        : function(v) {
            if (this[key] !== v) {
              getValue(this, $api).setConfig(name, v);
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
        $api = api.get(target);
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
      descriptor,
      key,
      kind,
      placement,
      ...methodPart,
    };
  }

  return $.accessor({
    get,
    initializer,
    key,
    set,
    ...accessorPart,
  });
};

export default createOptionDecorator;
