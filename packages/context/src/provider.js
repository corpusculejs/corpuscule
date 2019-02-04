import {assertKind, assertRequiredProperty, Kind} from '@corpuscule/utils/lib/asserts';
import getSupers from '@corpuscule/utils/lib/getSupers';
import {field, hook, lifecycleKeys, method} from '@corpuscule/utils/lib/descriptors';
import {getValue} from '@corpuscule/utils/lib/propertyUtils';
import {checkValue} from './utils';

const createProvider = (
  {consumers, eventName, providers, value},
  [connectedCallbackKey, disconnectedCallbackKey],
) => descriptor => {
  assertKind('provider', Kind.Class, descriptor);

  const {elements, kind} = descriptor;

  let $value;

  const $$consumers = Symbol();
  const $$subscribe = Symbol();
  const $$unsubscribe = Symbol();

  const [supers, prepareSupers] = getSupers(elements, lifecycleKeys);

  return {
    elements: [
      ...elements,

      // Public
      method({
        key: connectedCallbackKey,
        method() {
          this.addEventListener(eventName, this[$$subscribe]);
          supers[connectedCallbackKey].call(this);
        },
        placement: 'own',
      }),
      method({
        key: disconnectedCallbackKey,
        method() {
          this.removeEventListener(eventName, this[$$subscribe]);
          supers[disconnectedCallbackKey].call(this);
        },
        placement: 'own',
      }),

      // Private
      field({
        initializer: () => [],
        key: $$consumers,
      }),
      method({
        bound: true,
        key: $$unsubscribe,
        method(consume) {
          this[$$consumers] = this[$$consumers].filter(p => p !== consume);
        },
      }),
      method({
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

      // Hooks
      hook({
        start() {
          providers.add(this);
          consumers.set(this, $$consumers);
        },
      }),
    ],
    finisher(target) {
      checkValue(value, target);
      prepareSupers(target);

      $value = value.get(target);

      assertRequiredProperty('provider', 'value', $value);
    },
    kind,
  };
};

export default createProvider;
