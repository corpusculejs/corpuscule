import {assertKind, assertRequiredProperty, Kind} from '@corpuscule/utils/lib/asserts';
import getSupers from '@corpuscule/utils/lib/getSupers';
import {lifecycleKeys, method} from '@corpuscule/utils/lib/descriptors';
import {method as lifecycleMethod} from '@corpuscule/utils/lib/lifecycleDescriptors';
import {setValue} from '@corpuscule/utils/lib/propertyUtils';
import {filter, noop} from './utils';

const createConsumer = (
  {eventName, value},
  [connectedCallbackKey, disconnectedCallbackKey],
) => descriptor => {
  assertKind('consumer', Kind.Class, descriptor);

  const {elements, finisher = noop, kind} = descriptor;

  let constructor;
  let $value;

  const getConstructor = () => constructor;

  const $$consume = Symbol();
  const $$unsubscribe = Symbol();

  const [supers, prepareSupers] = getSupers(elements, lifecycleKeys);

  return {
    elements: [
      // Public
      ...lifecycleMethod(
        {
          key: connectedCallbackKey,
          method() {
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
          },
        },
        supers,
        getConstructor,
      ),
      ...lifecycleMethod(
        {
          key: disconnectedCallbackKey,
          method() {
            if (this[$$unsubscribe]) {
              this[$$unsubscribe](this[$$consume]);
            }

            supers[disconnectedCallbackKey].call(this);
          },
        },
        supers,
        getConstructor,
      ),

      // Private
      method({
        bound: true,
        key: $$consume,
        method(v) {
          setValue(this, $value, v);
        },
      }),

      // Original elements
      ...filter(elements),
    ],
    finisher(target) {
      finisher(target);
      constructor = target;

      $value = value.get(target);
      assertRequiredProperty('consumer', 'value', $value);

      prepareSupers(target);
    },
    kind,
  };
};

export default createConsumer;
