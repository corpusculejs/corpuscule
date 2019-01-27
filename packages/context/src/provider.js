import {assertKind} from '@corpuscule/utils/lib/asserts';
import getSupers from '@corpuscule/utils/lib/getSupers';
import * as $ from '@corpuscule/utils/lib/descriptors';
import {getValue} from '@corpuscule/utils/lib/propertyUtils';
import {checkValue} from './utils';

const createProvider = (
  {consumers, eventName, providers, value},
  [connectedCallbackKey, disconnectedCallbackKey],
) => ({elements, kind}) => {
  assertKind('provider', 'class', kind);

  let $value;

  const $$consumers = Symbol();
  const $$subscribe = Symbol();
  const $$unsubscribe = Symbol();

  const [supers, prepareSupers] = getSupers(elements, $.lifecycleKeys);

  return {
    elements: [
      ...elements,

      // Public
      $.method({
        key: connectedCallbackKey,
        method() {
          this.addEventListener(eventName, this[$$subscribe]);
          supers[connectedCallbackKey].call(this);
        },
        placement: 'own',
      }),
      $.method({
        key: disconnectedCallbackKey,
        method() {
          this.removeEventListener(eventName, this[$$subscribe]);
          supers[disconnectedCallbackKey].call(this);
        },
        placement: 'own',
      }),

      // Private
      $.field({
        initializer: () => [],
        key: $$consumers,
      }),
      $.method({
        bound: true,
        key: $$unsubscribe,
        method(consume) {
          this[$$consumers] = this[$$consumers].filter(p => p !== consume);
        },
      }),
      $.method({
        bound: true,
        key: $$subscribe,
        method(event) {
          const {consume} = event.detail;

          this[$$consumers].push(consume);
          consume(getValue(this, $value));

          event.detail.unsubscribe = this[$$unsubscribe];
          event.stopPropagation();
        },
      }),

      // Initializers
      $.field({
        initializer() {
          providers.add(this);
          consumers.set(this, $$consumers);
        },
        placement: 'static',
      }),
    ],
    finisher(target) {
      checkValue(value, target);
      prepareSupers(target);

      $value = value.get(target);
    },
    kind,
  };
};

export default createProvider;