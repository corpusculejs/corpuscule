/* eslint-disable no-invalid-this, prefer-arrow-callback */
import {assertKind, Kind} from '@corpuscule/utils/lib/asserts';
import {field, method, lifecycleKeys} from '@corpuscule/utils/lib/descriptors';
import getSupers from '@corpuscule/utils/lib/getSupers';
import {method as lifecycleMethod} from '@corpuscule/utils/lib/lifecycleDescriptors';
import defaultScheduler from '@corpuscule/utils/lib/scheduler';
import {
  internalChangedCallback as $internalChangedCallback,
  propertyChangedCallback as $propertyChangedCallback,
  render as $render,
  updatedCallback as $updatedCallback,
} from './tokens/lifecycle';
import {shadowElements} from './utils';

const attributeChangedCallbackKey = 'attributeChangedCallback';
const [connectedCallbackKey] = lifecycleKeys;

// eslint-disable-next-line no-empty-function
const noop = () => {};

const filteringNames = ['is', 'observedAttributes'];

const createElementDecorator = ({renderer, scheduler = defaultScheduler}) => (
  name,
  {extends: builtin, lightDOM = false} = {},
) => descriptor => {
  assertKind('element', Kind.Class, descriptor);

  const {elements, kind} = descriptor;

  const hasRender = elements.some(({key}) => key === $render);
  const isLight = lightDOM || (builtin && !shadowElements.includes(builtin));

  let constructor;
  const getConstructor = () => constructor;

  const $$connected = Symbol();
  const $$invalidate = Symbol();
  const $$root = Symbol();
  const $$valid = Symbol();

  const [supers, prepareSupers] = getSupers(elements, [
    attributeChangedCallbackKey,
    connectedCallbackKey,
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
            this[$$connected] = true;
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
          return this.constructor === constructor
            ? isLight
              ? this
              : this.attachShadow({mode: 'open'})
            : null;
        },
        key: $$root,
      }),
      field({
        initializer: () => true,
        key: $$valid,
      }),
      method({
        key: $$invalidate,
        method: hasRender
          ? async function() {
              if (!this[$$valid]) {
                return;
              }

              this[$$valid] = false;

              await scheduler(() => {
                renderer(this[$render](), this[$$root], this);
                this[$$valid] = true;
              });

              if (this[$$connected]) {
                this[$updatedCallback]();
              }
            }
          : noop,
      }),
    ],
    finisher(target) {
      prepareSupers(target);

      constructor = target;

      customElements.define(name, target, builtin && {extends: builtin});
    },
    kind,
  };
};

export default createElementDecorator;
