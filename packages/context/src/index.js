/* eslint-disable max-classes-per-file */
import {assertKind} from '@corpuscule/utils/lib/asserts';
import createSupers from '@corpuscule/utils/lib/createSupers';
import {accessor, field, lifecycleKeys, method} from '@corpuscule/utils/lib/descriptors';

const [connectedCallbackKey, disconnectedCallbackKey] = lifecycleKeys;

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

    const $$superConnectedCallback = Symbol();
    const $$superDisconnectedCallback = Symbol();

    const {initializer: providingValueInitializer = null} =
      elements.find(({key}) => key === providingValue) || {};

    const supers = createSupers(
      elements,
      new Map([
        [connectedCallbackKey, $$superConnectedCallback],
        [disconnectedCallbackKey, $$superDisconnectedCallback],
      ]),
    );

    return {
      elements: [
        ...elements.filter(({key}) => !lifecycleKeys.includes(key) && key !== providingValue),
        ...supers,

        // Public
        method(
          {
            key: connectedCallbackKey,
            value() {
              this.addEventListener(eventName, this[$$subscribe]);
              this[$$superConnectedCallback]();
            },
          },
          {isBound: true},
        ),
        method(
          {
            key: disconnectedCallbackKey,
            value() {
              this.removeEventListener(eventName, this[$$subscribe]);
              this[$$superDisconnectedCallback]();
            },
          },
          {isBound: true},
        ),

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
        }),
        field({
          initializer: providingValueInitializer || (() => defaultValue),
          key: $$value,
        }),
        method(
          {
            key: $$unsubscribe,
            value(consume) {
              this[$$consumers] = this[$$consumers].filter(p => p !== consume);
            },
          },
          {isBound: true},
        ),
        method(
          {
            key: $$subscribe,
            value(event) {
              const {consume} = event.detail;

              this[$$consumers].push(consume);
              consume(this[$$value]);

              event.detail.unsubscribe = this[$$unsubscribe];
              event.stopPropagation();
            },
          },
          {isBound: true},
        ),
      ],
      kind,
    };
  };

  const consumer = ({elements, kind}) => {
    assertKind('consumer', 'class', kind);

    const $$consume = Symbol();
    const $$unsubscribe = Symbol();

    const $$superConnectedCallback = Symbol();
    const $$superDisconnectedCallback = Symbol();

    const supers = createSupers(
      elements,
      new Map([
        [connectedCallbackKey, $$superConnectedCallback],
        [disconnectedCallbackKey, $$superDisconnectedCallback],
      ]),
    );

    return {
      elements: [
        ...elements.filter(({key}) => !lifecycleKeys.includes(key) && key !== contextValue),
        ...supers,

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

            this[$$superConnectedCallback]();
          },
        }),
        method({
          key: disconnectedCallbackKey,
          value() {
            if (this[$$unsubscribe]) {
              this[$$unsubscribe](this[$$consume]);
            }

            this[$$superDisconnectedCallback]();
          },
        }),

        // Private
        method(
          {
            key: $$consume,
            value(v) {
              this[contextValue] = v;
            },
          },
          {isBound: true},
        ),
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
