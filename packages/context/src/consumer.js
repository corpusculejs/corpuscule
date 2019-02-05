import {assertKind, assertRequiredProperty, Kind} from '@corpuscule/utils/lib/asserts';
import getSupers from '@corpuscule/utils/lib/getSupers';
import {field, lifecycleKeys, method} from '@corpuscule/utils/lib/descriptors';
import {setValue} from '@corpuscule/utils/lib/propertyUtils';
import {checkValue, filter} from './utils';

const createConsumer = (
  {eventName, value},
  [connectedCallbackKey, disconnectedCallbackKey],
) => descriptor => {
  assertKind('consumer', Kind.Class, descriptor);

  const {elements, kind} = descriptor;

  let constructor;
  let $value;

  const $$connectedCallback = Symbol();
  const $$disconnectedCallback = Symbol();
  const $$consume = Symbol();
  const $$unsubscribe = Symbol();

  const [supers, prepareSupers] = getSupers(elements, lifecycleKeys);

  return {
    elements: [
      ...filter(elements),

      // Public
      method({
        key: connectedCallbackKey,
        method() {
          // Workaround for Custom Element spec that cannot accept anything
          // than prototype method
          this[$$connectedCallback]();
        },
      }),
      method({
        key: disconnectedCallbackKey,
        method() {
          // Workaround for Custom Element spec that cannot accept anything
          // than prototype method
          this[$$disconnectedCallback]();
        },
      }),

      // Private
      field({
        initializer() {
          // Inheritance workaround. If class is inherited, it will use
          // user-defined callback, if not - system one.
          return this.constructor === constructor
            ? () => {
                const event = new CustomEvent(eventName, {
                  bubbles: true,
                  cancelable: true,
                  composed: true,
                  detail: {consume: this[$$consume]},
                });

                this.dispatchEvent(event);

                this[$$unsubscribe] = event.detail.unsubscribe;

                if (!this[$$unsubscribe]) {
                  throw new Error(`No provider found for ${this.constructor.name}`);
                }

                supers[connectedCallbackKey].call(this);
              }
            : supers[connectedCallbackKey];
        },
        key: $$connectedCallback,
      }),
      field({
        initializer() {
          // Inheritance workaround. If class is inherited, it will use
          // user-defined callback, if not - system one.
          return this.constructor === constructor
            ? () => {
                if (this[$$unsubscribe]) {
                  this[$$unsubscribe](this[$$consume]);
                }

                supers[disconnectedCallbackKey].call(this);
              }
            : supers[disconnectedCallbackKey];
        },
        key: $$disconnectedCallback,
      }),
      method({
        bound: true,
        key: $$consume,
        method(v) {
          setValue(this, $value, v);
        },
      }),
    ],
    finisher(target) {
      checkValue(value, target);

      constructor = target;
      $value = value.get(target);

      assertRequiredProperty('consumer', 'value', $value);

      prepareSupers(target);
    },
    kind,
  };
};

export default createConsumer;
