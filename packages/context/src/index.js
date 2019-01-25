/* eslint-disable max-classes-per-file */
import {assertKind} from '@corpuscule/utils/lib/asserts';
import * as $ from '@corpuscule/utils/lib/descriptors';
import getSupers from '@corpuscule/utils/lib/getSupers';

const [connectedCallbackKey, disconnectedCallbackKey] = $.lifecycleKeys;

const randomString = () => {
  const arr = new Uint32Array(2);
  const [rnd1, rnd2] = crypto.getRandomValues(arr);

  return `${rnd1}${rnd2}`;
};

const createContext = defaultValue => {
  const eventName = randomString();

  const providingValue = Symbol();
  const contextValue = Symbol();

  const provider = ({elements, kind}) => {
    assertKind('provider', 'class', kind);

    const $$consumers = Symbol();
    const $$subscribe = Symbol();
    const $$unsubscribe = Symbol();
    const $$value = Symbol();

    const {initializer: providingValueInitializer = null} =
      elements.find(({key}) => key === providingValue) || {};

    const [supers, finisher] = getSupers(elements, $.lifecycleKeys);

    return {
      elements: [
        ...elements.filter(({key}) => key !== providingValue),

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

        // Protected
        $.accessor({
          get() {
            return this[$$value];
          },
          key: providingValue,
          set(v) {
            this[$$value] = v;

            for (const cb of this[$$consumers]) {
              cb(v);
            }
          },
        }),

        // Private
        $.field({
          initializer: () => [],
          key: $$consumers,
        }),
        $.field({
          initializer: providingValueInitializer || (() => defaultValue),
          key: $$value,
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
            consume(this[$$value]);

            event.detail.unsubscribe = this[$$unsubscribe];
            event.stopPropagation();
          },
        }),
      ],
      finisher,
      kind,
    };
  };

  const consumer = ({elements, kind}) => {
    assertKind('consumer', 'class', kind);

    const $$consume = Symbol();
    const $$unsubscribe = Symbol();

    const [supers, finisher] = getSupers(elements, $.lifecycleKeys);

    return {
      elements: [
        ...elements.filter(({key}) => key !== contextValue),

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
            this[contextValue] = v;
          },
        }),
      ],
      finisher,
      kind,
    };
  };

  return {
    consumer,
    contextValue,
    provider,
    providingValue,
  };
};

export default createContext;
