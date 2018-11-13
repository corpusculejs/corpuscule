/* eslint-disable max-classes-per-file */
import {assertKind} from '@corpuscule/utils/lib/asserts';
import {
  accessor,
  field,
  method,
} from '@corpuscule/utils/lib/descriptors';
import getSuperMethods from '@corpuscule/utils/lib/getSuperMethods';

const randomString = () => {
  const arr = new Uint32Array(2);
  const [rnd1, rnd2] = crypto.getRandomValues(arr);

  return `${rnd1}${rnd2}`;
};

const connectedCallbackKey = 'connectedCallback';
const disconnectedCallbackKey = 'disconnectedCallback';

const methods = [connectedCallbackKey, disconnectedCallbackKey];

const createContext = (defaultValue) => {
  const eventName = randomString();

  const $$consume = Symbol();
  const $$consumers = Symbol();
  const $$subscribe = Symbol();
  const $$unsubscribe = Symbol();
  const $$value = Symbol();

  const providingValue = Symbol('providingValue');
  const contextValue = Symbol('contextValue');

  const provider = ({elements, kind}) => {
    assertKind('provider', 'class', kind);

    const {
      initializer: providingValueInitializer = null,
    } = elements.find(({key}) => key === providingValue) || {};

    const [
      superConnectedCallback,
      superDisconnectedCallback,
    ] = getSuperMethods(elements, methods);

    return {
      elements: [
        ...elements.filter(({key}) => !methods.includes(key) && key !== providingValue),

        // Public
        method({
          key: connectedCallbackKey,
          value() {
            this.addEventListener(eventName, this[$$subscribe]);
            superConnectedCallback.call(this);
          },
        }),
        method({
          key: disconnectedCallbackKey,
          value() {
            this.removeEventListener(eventName, this[$$subscribe]);
            superDisconnectedCallback.call(this);
          },
        }),

        // Protected
        accessor({
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
        field({
          initializer: () => [],
          key: $$consumers,
        }, {isPrivate: true}),
        field({
          initializer: providingValueInitializer || (() => defaultValue),
          key: $$value,
        }, {isPrivate: true}),
        method({
          key: $$unsubscribe,
          value(consume) {
            this[$$consumers] = this[$$consumers].filter(p => p !== consume);
          },
        }, {isBound: true, isPrivate: true}),
        method({
          key: $$subscribe,
          value(event) {
            const {consume} = event.detail;

            this[$$consumers].push(consume);
            consume(this[$$value]);

            event.detail.unsubscribe = this[$$unsubscribe];
            event.stopPropagation();
          },
        }, {isPrivate: true}),
      ],
      kind,
    };
  };

  const consumer = ({elements, kind}) => {
    assertKind('consumer', 'class', kind);

    const [
      superConnectedCallback,
      superDisconnectedCallback,
    ] = getSuperMethods(elements, methods);

    return {
      elements: [
        ...elements.filter(({key}) => !methods.includes(key) && key !== contextValue),

        // Public
        method({
          key: connectedCallbackKey,
          value() {
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

            superConnectedCallback.call(this);
          },
        }),
        method({
          key: disconnectedCallbackKey,
          value() {
            if (this[$$unsubscribe]) {
              this[$$unsubscribe](this[$$consume]);
            }

            superDisconnectedCallback.call(this);
          },
        }),

        // Private
        method({
          key: $$consume,
          value(v) {
            this[contextValue] = v;
          },
        }, {isBound: true, isPrivate: true}),
      ],
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
