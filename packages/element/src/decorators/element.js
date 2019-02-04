/* eslint-disable no-invalid-this, prefer-arrow-callback */
import {assertKind, Kind} from '@corpuscule/utils/lib/asserts';
import {field, method, hook, lifecycleKeys} from '@corpuscule/utils/lib/descriptors';
import defaultScheduler from '@corpuscule/utils/lib/scheduler';
import {
  createRoot as $createRoot,
  updatedCallback as $updatedCallback,
  propertyChangedCallback as $propertyChangedCallback,
  render as $render,
  internalChangedCallback as $internalChangedCallback,
} from '../tokens/lifecycle';
import getSupers from '@corpuscule/utils/lib/getSupers';
import {shadowElements} from '../utils';

const attributeChangedCallbackKey = 'attributeChangedCallback';
const [connectedCallbackKey] = lifecycleKeys;

// eslint-disable-next-line no-empty-function
const noop = () => {};

const filteringNames = ['is', 'observedAttributes'];

const rootProperty = new WeakMap();

const createElementDecorator = ({renderer, scheduler = defaultScheduler}) => (
  name,
  {extends: builtin} = {},
) => descriptor => {
  assertKind('element', Kind.Class, descriptor);

  const {elements, kind} = descriptor;

  const hasRender = elements.some(({key}) => key === $render);

  const isShadow = !builtin || shadowElements.includes(builtin);

  if (isShadow && !hasRender) {
    throw new Error('[render]() is not implemented');
  }

  if (!isShadow && hasRender) {
    throw new Error(`[render]() is not allowed for <${builtin}> element`);
  }

  const $$connected = Symbol();
  const $$invalidate = Symbol();
  const $$valid = Symbol();

  const [supers, finish] = getSupers(elements, [
    attributeChangedCallbackKey,
    connectedCallbackKey,
    $createRoot,
    $internalChangedCallback,
    $propertyChangedCallback,
    $updatedCallback,
  ]);

  return {
    elements: [
      ...elements.filter(
        ({key, placement}) =>
          !(
            (filteringNames.includes(key) && placement === 'static') ||
            ((key === connectedCallbackKey || key === attributeChangedCallbackKey) &&
              placement === 'own')
          ),
      ),

      // Static
      field({
        initializer: () => name,
        key: 'is',
        placement: 'static',
        writable: false,
      }),
      field({
        initializer: () => [],
        key: 'observedAttributes',
        placement: 'static',
        writable: false,
      }),

      // Public
      method({
        key: connectedCallbackKey,
        async method() {
          await this[$$invalidate]();
          supers[connectedCallbackKey].call(this);
        },
        placement: 'own',
      }),
      method({
        key: attributeChangedCallbackKey,
        async method(attributeName, oldValue, newValue) {
          if (oldValue === newValue || !this[$$connected]) {
            return;
          }

          supers[attributeChangedCallbackKey].call(this, attributeName, oldValue, newValue);
          await this[$$invalidate]();
        },
        placement: 'own',
      }),

      // Protected
      method({
        key: $createRoot,
        method() {
          return supers[$createRoot].call(this);
        },
        placement: 'own',
      }),
      method({
        key: $internalChangedCallback,
        async method(internalName, oldValue, newValue) {
          if (!this[$$connected]) {
            return;
          }

          supers[$internalChangedCallback].call(this, internalName, oldValue, newValue);
          await this[$$invalidate]();
        },
        placement: 'own',
      }),
      method({
        key: $propertyChangedCallback,
        async method(propertyName, oldValue, newValue) {
          if (oldValue === newValue || !this[$$connected]) {
            return;
          }

          supers[$propertyChangedCallback].call(this, propertyName, oldValue, newValue);
          await this[$$invalidate]();
        },
        placement: 'own',
      }),
      method({
        key: $updatedCallback,
        async method() {
          supers[$updatedCallback].call(this);
        },
        placement: 'own',
      }),

      // Private
      field({
        initializer: () => false,
        key: $$connected,
      }),
      hook({
        placement: 'own',
        start() {
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
        method: isShadow
          ? async function() {
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
            }
          : noop,
      }),
    ],
    finisher(target) {
      finish(target, {
        [$createRoot]: isShadow
          ? function() {
              return this.attachShadow({mode: 'open'});
            }
          : noop,
      });

      customElements.define(name, target, builtin && {extends: builtin});
    },
    kind,
  };
};

export default createElementDecorator;
