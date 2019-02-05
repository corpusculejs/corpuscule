/* eslint-disable no-invalid-this, prefer-arrow-callback */
import {assertKind, Kind} from '@corpuscule/utils/lib/asserts';
import {field, method, lifecycleKeys} from '@corpuscule/utils/lib/descriptors';
import getSupers from '@corpuscule/utils/lib/getSupers';
import {method as lifecycleMethod} from '@corpuscule/utils/lib/lifecycleDescriptors';
import defaultScheduler from '@corpuscule/utils/lib/scheduler';
import {
  createRoot as $createRoot,
  updatedCallback as $updatedCallback,
  propertyChangedCallback as $propertyChangedCallback,
  render as $render,
  internalChangedCallback as $internalChangedCallback,
} from './tokens/lifecycle';
import {shadowElements} from './utils';

const attributeChangedCallbackKey = 'attributeChangedCallback';
const [connectedCallbackKey] = lifecycleKeys;

// eslint-disable-next-line no-empty-function
const noop = () => {};

const filteringNames = ['is', 'observedAttributes'];

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

  let constructor;
  const getConstructor = () => constructor;

  const $$connected = Symbol();
  const $$invalidate = Symbol();
  const $$root = Symbol();
  const $$valid = Symbol();

  const [supers, prepareSupers] = getSupers(elements, [
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
              placement === 'prototype')
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
      ...lifecycleMethod(
        {
          key: connectedCallbackKey,
          async method() {
            await this[$$invalidate]();
            supers[connectedCallbackKey].call(this);
          },
        },
        supers,
        getConstructor,
      ),
      ...lifecycleMethod(
        {
          key: attributeChangedCallbackKey,
          async method(attributeName, oldValue, newValue) {
            if (oldValue === newValue || !this[$$connected]) {
              return;
            }

            supers[attributeChangedCallbackKey].call(this, attributeName, oldValue, newValue);
            await this[$$invalidate]();
          },
        },
        supers,
        getConstructor,
      ),

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
      field({
        initializer() {
          // Inheritance workaround. If class is inherited, it will do nothing
          return this.constructor === constructor ? this[$createRoot]() : null;
        },
        key: $$root,
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
                renderer(this[$render](), this[$$root], this);
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
      prepareSupers(target, {
        [$createRoot]: isShadow
          ? function() {
              return this.attachShadow({mode: 'open'});
            }
          : noop,
      });

      constructor = target;

      // Registry creates an instance of the class, so it is necessary to wait
      // unit all finishers are called
      Promise.resolve().then(() => {
        customElements.define(name, target, builtin && {extends: builtin});
      });
    },
    kind,
  };
};

export default createElementDecorator;
