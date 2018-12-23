/* eslint-disable no-invalid-this, prefer-arrow-callback */
import {assertKind} from '@corpuscule/utils/lib/asserts';
import createSupers from '@corpuscule/utils/lib/createSupers';
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

const filteringNames = ['is', 'observedAttributes'];

const rootProperty = new WeakMap();

const element = (name, {extends: builtin, renderer, scheduler = defaultScheduler}) => ({
  kind,
  elements,
}) => {
  assertKind('element', 'class', kind);

  const hasRender = elements.some(({key}) => key === $render);

  if (!builtin && !hasRender) {
    throw new Error('[render]() is not implemented');
  }

  if (builtin && hasRender) {
    throw new Error('[render]() cannot be used for built-in elements');
  }

  const $$connected = Symbol();
  const $$invalidate = Symbol();
  const $$valid = Symbol();

  const $$superAttributeChangedCallback = Symbol();
  const $$superConnectedCallback = Symbol();
  const $$superInternalChangedCallback = Symbol();
  const $$superPropertyChangedCallback = Symbol();

  const supers = createSupers(
    elements,
    new Map([
      [attributeChangedCallbackKey, $$superAttributeChangedCallback],
      [connectedCallbackKey, $$superConnectedCallback],
      [
        $createRoot,
        {
          fallback: builtin
            ? noop
            : function() {
                return this.attachShadow({mode: 'open'});
              },
          key: $createRoot,
        },
      ],
      [$internalChangedCallback, $$superInternalChangedCallback],
      [$propertyChangedCallback, $$superPropertyChangedCallback],
      [
        $updatedCallback,
        {
          fallback: noop,
          key: $updatedCallback,
        },
      ],
    ]),
  );

  return {
    elements: [
      ...elements.filter(({key}) => !filteringNames.includes(key)),
      ...supers,

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
            this[$$superConnectedCallback]();
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

            this[$$superAttributeChangedCallback](attributeName, oldValue, newValue);
            await this[$$invalidate]();
          },
        },
        {isBound: true},
      ),

      // Protected
      method(
        {
          key: $internalChangedCallback,
          async value(internalName, oldValue, newValue) {
            if (!this[$$connected]) {
              return;
            }

            this[$$superInternalChangedCallback](internalName, oldValue, newValue);
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

            this[$$superPropertyChangedCallback](propertyName, oldValue, newValue);
            await this[$$invalidate]();
          },
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
          if (!rootProperty.has(this)) {
            rootProperty.set(this, this[$createRoot]());
          }
        },
      }),
      field({
        initializer: () => true,
        key: $$valid,
      }),
      method({
        key: $$invalidate,
        value: builtin
          ? noop
          : async function() {
              if (!this[$$valid]) {
                return;
              }

              this[$$valid] = false;

              const isConnecting = !this[$$connected];

              await scheduler(() => {
                renderer(this[$render](), rootProperty.get(this), this);
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
      customElements.define(name, target, builtin && {extends: builtin});
    },
    kind,
  };
};

export default element;
