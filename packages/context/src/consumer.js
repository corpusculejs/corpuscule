import {assertKind} from '@corpuscule/utils/lib/asserts';
import getSupers from '@corpuscule/utils/lib/getSupers';
import * as $ from '@corpuscule/utils/lib/descriptors';
import {setValue} from '@corpuscule/utils/lib/propertyUtils';
import {checkValue} from './utils';

const createConsumer = ({eventName, value}, [connectedCallbackKey, disconnectedCallbackKey]) => ({
  elements,
  kind,
}) => {
  assertKind('consumer', 'class', kind);

  let $value;

  const $$consume = Symbol();
  const $$unsubscribe = Symbol();

  const [supers, prepareSupers] = getSupers(elements, $.lifecycleKeys);

  return {
    elements: [
      ...elements,

      // Public
      $.method({
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
        placement: 'own',
      }),
      $.method({
        key: disconnectedCallbackKey,
        method() {
          if (this[$$unsubscribe]) {
            this[$$unsubscribe](this[$$consume]);
          }

          supers[disconnectedCallbackKey].call(this);
        },
        placement: 'own',
      }),

      // Private
      $.method({
        bound: true,
        key: $$consume,
        method(v) {
          setValue(this, $value, v);
        },
      }),
    ],
    finisher(target) {
      checkValue(value, target);

      $value = value.get(target);
      prepareSupers(target);
    },
    kind,
  };
};

export default createConsumer;
