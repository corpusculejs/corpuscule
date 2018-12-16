/* eslint-disable no-invalid-this, prefer-arrow-callback */
import {assertKind} from '@corpuscule/utils/lib/asserts';
import getSuperMethods from '@corpuscule/utils/lib/getSuperMethods';
import {field, lifecycleKeys, method} from '@corpuscule/utils/lib/descriptors';
import defaultScheduler from '@corpuscule/utils/lib/scheduler';
import {
  createRoot as $createRoot,
  updatedCallback as $updatedCallback,
  propertyChangedCallback as $propertyChangedCallback,
  render as $render,
  internalChangedCallback as $internalChangedCallback,
} from '../tokens/lifecycle';

const attributeChangedCallbackKey = 'attributeChangedCallback';
const [connectedCallbackKey] = lifecycleKeys;

// eslint-disable-next-line no-empty-function
const noop = () => {};

const methods = [
  attributeChangedCallbackKey,
  connectedCallbackKey,
  $createRoot,
  $internalChangedCallback,
  $propertyChangedCallback,
  $updatedCallback,
];

const filteringNames = ['is', 'observedAttributes'];

const element = (name, {renderer, scheduler = defaultScheduler}) => ({kind, elements}) => {
  assertKind('element', 'class', kind);

  if (!elements.find(({key}) => key === $render)) {
    throw new Error('[render]() is not implemented');
  }

  const $$connected = Symbol();
  const $$invalidate = Symbol();
  const $$root = Symbol();
  const $$valid = Symbol();

  const [
    superAttributeChangedCallback,
    superConnectedCallback,
    superCreateRoot,
    superInternalChangedCallback,
    superPropertyChangedCallback,
    superUpdatedCallback,
  ] = getSuperMethods(elements, methods, {
    [$createRoot]() {
      return this.attachShadow({mode: 'open'});
    },
    [$updatedCallback]: noop,
  });

  return {
    elements: [
      ...elements.filter(({key}) => !filteringNames.includes(key)),

      // Static
      field(
        {
          initializer: () => name,
          key: 'is',
        },
        {isReadonly: true, isStatic: true},
      ),
      field(
        {
          initializer: () => [],
          key: 'observedAttributes',
        },
        {isReadonly: true, isStatic: true},
      ),

      // Public
      method(
        {
          key: connectedCallbackKey,
          async value() {
            await this[$$invalidate]();
            superConnectedCallback.call(this);
          },
        },
        {isBound: true},
      ),
      method(
        {
          key: attributeChangedCallbackKey,
          async value(attributeName, oldValue, newValue) {
            if (oldValue === newValue || !this[$$connected]) {
              return;
            }

            superAttributeChangedCallback.call(this, attributeName, oldValue, newValue);

            await this[$$invalidate]();
          },
        },
        {isBound: true},
      ),

      // Protected
      method(
        {
          key: $createRoot,
          value: superCreateRoot,
        },
        {isBound: true},
      ),
      method(
        {
          key: $internalChangedCallback,
          async value(internalName, oldValue, newValue) {
            if (!this[$$connected]) {
              return;
            }

            superInternalChangedCallback.call(this, internalName, oldValue, newValue);

            await this[$$invalidate]();
          },
        },
        {isBound: true},
      ),
      method(
        {
          key: $propertyChangedCallback,
          async value(propertyName, oldValue, newValue) {
            if (oldValue === newValue || !this[$$connected]) {
              return;
            }

            superPropertyChangedCallback.call(this, propertyName, oldValue, newValue);
            await this[$$invalidate]();
          },
        },
        {isBound: true},
      ),
      method(
        {
          key: $updatedCallback,
          value: superUpdatedCallback,
        },
        {isBound: true},
      ),

      // Private
      field({
        initializer: () => false,
        key: $$connected,
      }),
      field({
        initializer() {
          return this[$createRoot]();
        },
        key: $$root,
      }),
      field({
        initializer: () => true,
        key: $$valid,
      }),
      method({
        key: $$invalidate,
        async value() {
          if (!this[$$valid]) {
            return;
          }

          this[$$valid] = false;

          const isConnecting = !this[$$connected];

          await scheduler(() => {
            renderer(this[$render](), this[$$root], this);
            this[$$connected] = true;
            this[$$valid] = true;
          });

          if (!isConnecting) {
            this[$updatedCallback]();
          }
        },
      }),
    ],
    finisher(target) {
      customElements.define(name, target);
    },
    kind,
  };
};

export default element;
