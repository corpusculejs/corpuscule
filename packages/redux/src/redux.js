import {assertKind, Kind} from '@corpuscule/utils/lib/asserts';
import getSupers from '@corpuscule/utils/lib/getSupers';
import {accessor, field, hook, lifecycleKeys, method} from '@corpuscule/utils/lib/descriptors';
import {getValue, setValue} from '@corpuscule/utils/lib/propertyUtils';

const [, disconnectedCallbackKey] = lifecycleKeys;

export const createReduxDecorator = ({consumer, value}, {units}, {store}) => descriptor => {
  assertKind('connect', Kind.Class, descriptor);

  const {elements, kind} = consumer(descriptor);

  let constructor;
  let unitMap;

  const $$api = Symbol();
  const $$disconnectedCallback = Symbol();
  const $$subscribe = Symbol();
  const $$unsubscribe = Symbol();
  const $$update = Symbol();

  const [supers, finish] = getSupers(elements, [disconnectedCallbackKey]);
  const {descriptor: contextDescriptor, extras, finisher: finishContext, ...contextValue} = value(
    field({key: $$api}),
  );

  return {
    elements: [
      ...elements.filter(
        ({key, placement}) => !(key === disconnectedCallbackKey && placement === 'prototype'),
      ),

      // Public
      method({
        key: disconnectedCallbackKey,
        method() {
          // Workaround for Custom Element spec that cannot accept anything
          // than prototype method
          this[$$disconnectedCallback]();
        },
      }),

      // Context
      accessor({
        adjust: ({get: originalGet, set: originalSet}) => ({
          get: originalGet,
          set(v) {
            originalSet.call(this, v);

            if (this[$$unsubscribe]) {
              this[$$unsubscribe]();
            }

            this[$$subscribe]();
          },
        }),
        ...contextDescriptor,
        ...contextValue,
      }),
      ...extras,

      // Private
      field({
        initializer() {
          // Inheritance workaround. If class is inherited, it will use
          // user-defined callback, if not - system one.
          return this.constructor === constructor
            ? () => {
                supers[disconnectedCallbackKey].call(this);

                if (this[$$unsubscribe]) {
                  this[$$unsubscribe]();
                }
              }
            : supers[disconnectedCallbackKey];
        },
        key: $$disconnectedCallback,
      }),
      method({
        key: $$subscribe,
        method() {
          const context = getValue(this, $$api);
          this[$$update](context);

          this[$$unsubscribe] = context.subscribe(() => {
            this[$$update](context);
          });
        },
      }),
      method({
        key: $$update,
        method({getState}) {
          if (unitMap.size === 0) {
            return;
          }

          const state = getState();

          for (const [key, getter] of unitMap) {
            const v = getter(state);

            if (v !== getValue(this, key)) {
              setValue(this, key, v);
            }
          }
        },
      }),

      // Hooks
      hook({
        start() {
          store.set(this, $$api);
          units.set(this, new Map());
        },
      }),
    ],
    finisher(target) {
      constructor = target;
      unitMap = units.get(target);
      finish(target);
      finishContext(target);
    },
    kind,
  };
};
