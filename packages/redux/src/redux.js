import {assertKind} from '@corpuscule/utils/lib/asserts';
import getSupers from '@corpuscule/utils/lib/getSupers';
import {accessor, field, hook, lifecycleKeys, method} from '@corpuscule/utils/lib/descriptors';
import {getValue, setValue} from '@corpuscule/utils/lib/propertyUtils';

const [, disconnectedCallbackKey] = lifecycleKeys;

export const createReduxDecorator = ({consumer, value}, {units}, {store}) => classDescriptor => {
  assertKind('connect', 'class', classDescriptor.kind);

  const {elements, kind} = consumer(classDescriptor);

  let unitList;

  const $$api = Symbol();
  const $$subscribe = Symbol();
  const $$unsubscribe = Symbol();
  const $$update = Symbol();

  const [supers, finish] = getSupers(elements, [disconnectedCallbackKey]);
  const {descriptor: contextDescriptor, extras, finisher: finishContext, ...contextValue} = value(
    field({key: $$api}),
  );

  return {
    elements: [
      ...elements,

      // Public
      method({
        key: disconnectedCallbackKey,
        method() {
          supers[disconnectedCallbackKey].call(this);

          if (this[$$unsubscribe]) {
            this[$$unsubscribe]();
          }
        },
        placement: 'own',
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
      ...(extras || []),

      // Private
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
          if (!unitList) {
            return;
          }

          const state = getState();

          for (const key of unitList) {
            setValue(this, key, state);
          }
        },
      }),

      // Hooks
      hook({
        start() {
          store.set(this, $$api);
          units.set(this, []);
        },
      }),
    ],
    finisher(target) {
      unitList = units.get(target);
      finish(target);
      finishContext(target);
    },
    kind,
  };
};
