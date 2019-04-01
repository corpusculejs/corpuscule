/* eslint-disable no-invalid-this, prefer-arrow-callback */
import getSupers from '@corpuscule/utils/lib/getSupers';
import defaultScheduler from '@corpuscule/utils/lib/scheduler';
import {
  internalChangedCallback as $internalChangedCallback,
  propertyChangedCallback as $propertyChangedCallback,
  render as $render,
  updatedCallback as $updatedCallback,
} from './tokens/lifecycle';
import {defaultDescriptor, noop, shadowElements} from './utils';

const readonlyPropertiesDescriptor = {
  ...defaultDescriptor,
  writable: false,
};

const element = (
  name,
  {extends: builtin, lightDOM = false, renderer, scheduler = defaultScheduler} = {},
) => target => {
  const {prototype} = target;
  const hasRender = $render in prototype;
  const isLight = lightDOM || (builtin && !shadowElements.includes(builtin));

  const $$attributeChangedCallback = Symbol();
  const $$connected = Symbol();
  const $$connectedCallback = Symbol();
  const $$invalidate = Symbol();
  const $$root = Symbol();
  const $$valid = Symbol();

  const supers = getSupers(prototype, [
    'attributeChangedCallback',
    'connectedCallback',
    $internalChangedCallback,
    $propertyChangedCallback,
    $updatedCallback,
  ]);

  Object.defineProperties(target, {
    is: {
      ...readonlyPropertiesDescriptor,
      value: name,
    },
    observedAttributes: {
      ...readonlyPropertiesDescriptor,
      value: [],
    },
  });

  Object.assign(prototype, {
    attributeChangedCallback(...args) {
      this[$$attributeChangedCallback](...args);
    },
    connectedCallback() {
      this[$$connectedCallback]();
    },
    // eslint-disable-next-line sort-keys
    [$$invalidate]: hasRender
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
    async [$internalChangedCallback](internalName, oldValue, newValue) {
      if (!this[$$connected]) {
        return;
      }

      supers[$internalChangedCallback].call(this, internalName, oldValue, newValue);
      await this[$$invalidate]();
    },
    async [$propertyChangedCallback](propertyName, oldValue, newValue) {
      if (oldValue === newValue || !this[$$connected]) {
        return;
      }

      supers[$propertyChangedCallback].call(this, propertyName, oldValue, newValue);
      await this[$$invalidate]();
    },
    [$updatedCallback]: supers[$updatedCallback],
  });

  target.__initializers.push(self => {
    // Inheritance workaround. If class is inherited, method will work in a different way
    const isExtended = self.constructor !== target;

    Object.assign(self, {
      [$$attributeChangedCallback]: isExtended
        ? supers.attributeChangedCallback
        : async function(attributeName, oldValue, newValue) {
            if (oldValue === newValue || !self[$$connected]) {
              return;
            }

            supers.attributeChangedCallback.call(self, attributeName, oldValue, newValue);
            await self[$$invalidate]();
          },
      [$$connected]: false,
      [$$connectedCallback]: isExtended
        ? supers.connectedCallback
        : async function() {
            await self[$$invalidate]();
            self[$$connected] = true;
            supers.connectedCallback.call(self);
          },
      [$$root]: isExtended ? null : isLight ? self : self.attachShadow({mode: 'open'}),
      [$$valid]: true,
    });
  });

  // Deferring custom element definition allows to run it at the end of all
  // decorators execution which helps to fix many issues connected with
  // immediate custom element instance creation during definition.
  Promise.resolve().then(() => {
    customElements.define(name, target, builtin && {extends: builtin});
  });
};

export default element;
