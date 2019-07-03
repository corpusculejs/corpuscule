/* eslint-disable no-invalid-this, prefer-arrow-callback */
import defineExtendable from '@corpuscule/utils/lib/defineExtendable';
import reflectClassMethods from '@corpuscule/utils/lib/reflectClassMethods';
import defaultScheduler from '@corpuscule/utils/lib/scheduler';
import {
  internalChangedCallback as $internalChangedCallback,
  propertyChangedCallback as $propertyChangedCallback,
  render as $render,
  updatedCallback as $updatedCallback,
} from './tokens/lifecycle';
import {noop, shadowElements} from './utils';

const readonlyPropertyDescriptor = {
  configurable: true,
  enumerable: true,
  writable: false,
};

const element = (
  name,
  {extends: builtin, lightDOM, renderer, scheduler = defaultScheduler} = {},
) => target => {
  const {prototype} = target;
  const hasRender = $render in prototype;
  const isLight = lightDOM || (builtin && !shadowElements.includes(builtin));

  const $$connected = Symbol();
  const $$invalidate = Symbol();
  const $$root = Symbol();
  const $$valid = Symbol();

  const supers = reflectClassMethods(prototype, [
    'attributeChangedCallback',
    'connectedCallback',
    $internalChangedCallback,
    $propertyChangedCallback,
    $updatedCallback,
  ]);

  Object.defineProperties(target, {
    is: {
      ...readonlyPropertyDescriptor,
      value: name,
    },
    observedAttributes: {
      ...readonlyPropertyDescriptor,
      value: [],
    },
  });

  defineExtendable(
    target,
    {
      async attributeChangedCallback(attributeName, oldValue, newValue) {
        if (oldValue === newValue || !this[$$connected]) {
          return;
        }

        supers.attributeChangedCallback.call(this, attributeName, oldValue, newValue);
        await this[$$invalidate]();
      },
      async connectedCallback() {
        await this[$$invalidate]();
        this[$$connected] = true;
        supers.connectedCallback.call(this);
      },
    },
    supers,
    target.__initializers,
  );

  Object.assign(prototype, {
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
    self[$$connected] = false;
    self[$$root] =
      self.constructor !== target ? null : isLight ? self : self.attachShadow({mode: 'open'});
    self[$$valid] = true;
  });

  // Deferring custom element definition allows to run it at the end of all
  // decorators execution which helps to fix many issues connected with
  // immediate custom element instance creation during definition.
  Promise.resolve().then(() => {
    customElements.define(name, target, builtin && {extends: builtin});
  });
};

export default element;
