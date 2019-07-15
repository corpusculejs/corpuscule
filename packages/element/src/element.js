/* eslint-disable no-invalid-this, prefer-arrow-callback */
import defineExtendable from '@corpuscule/utils/lib/defineExtendable';
import reflectClassMethods from '@corpuscule/utils/lib/reflectClassMethods';
import defaultScheduler from '@corpuscule/utils/lib/scheduler';
import {setObject} from '@corpuscule/utils/lib/setters';
import {noop, shadowElements, sharedPropertiesRegistry} from './utils';

const readonlyPropertyDescriptor = {
  configurable: true,
  enumerable: true,
  writable: false,
};

const element = (
  name,
  {extends: builtin, lightDOM, renderer, scheduler = defaultScheduler} = {},
) => klass => {
  const {prototype} = klass;
  const isLight = lightDOM || (builtin && !shadowElements.includes(builtin));

  let $internalChangedCallback;
  let $propertyChangedCallback;
  let $render;
  let $updatedCallback;

  const $$connected = Symbol();
  const $$internalChangedCallback = Symbol();
  const $$invalidate = Symbol();
  const $$noop = Symbol();
  const $$propertyChangedCallback = Symbol();
  const $$root = Symbol();
  const $$valid = Symbol();

  // Sharing fallback property names; they will be used internally if the user
  // did not define any of them.
  setObject(sharedPropertiesRegistry, klass, {
    $$internalChangedCallback,
    $$propertyChangedCallback,
  });

  klass.__registrations.push(() => {
    // Fallback property names will be used if user did not define one of the
    // following properties.
    ({
      internalChangedCallback: $internalChangedCallback = $$internalChangedCallback,
      propertyChangedCallback: $propertyChangedCallback = $$propertyChangedCallback,
      render: $render,
      // If the user did not define the `updatedCallback`, noop will be used.
      updatedCallback: $updatedCallback = $$noop,
    } = sharedPropertiesRegistry.get(klass) || {});

    // If there are undefined properties, `noop` will be used as a reflection.
    const internalMethods = reflectClassMethods(prototype, [
      $internalChangedCallback,
      $propertyChangedCallback,
    ]);

    Object.assign(prototype, {
      [$$invalidate]:
        $render && renderer
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
      [$$noop]: noop,
      async [$internalChangedCallback](internalName, oldValue, newValue) {
        if (!this[$$connected]) {
          return;
        }

        internalMethods[$internalChangedCallback].call(this, internalName, oldValue, newValue);
        await this[$$invalidate]();
      },
      async [$propertyChangedCallback](propertyName, oldValue, newValue) {
        if (oldValue === newValue || !this[$$connected]) {
          return;
        }

        internalMethods[$propertyChangedCallback].call(this, propertyName, oldValue, newValue);
        await this[$$invalidate]();
      },
    });
  });

  Object.defineProperties(klass, {
    is: {
      ...readonlyPropertyDescriptor,
      value: name,
    },
    observedAttributes: {
      ...readonlyPropertyDescriptor,
      value: [],
    },
  });

  const regularMethods = reflectClassMethods(prototype, [
    'attributeChangedCallback',
    'connectedCallback',
  ]);

  defineExtendable(
    klass,
    {
      async attributeChangedCallback(attributeName, oldValue, newValue) {
        if (oldValue === newValue || !this[$$connected]) {
          return;
        }

        regularMethods.attributeChangedCallback.call(this, attributeName, oldValue, newValue);
        await this[$$invalidate]();
      },
      async connectedCallback() {
        await this[$$invalidate]();
        this[$$connected] = true;
        regularMethods.connectedCallback.call(this);
      },
    },
    regularMethods,
    klass.__initializers,
  );

  klass.__initializers.push(self => {
    self[$$connected] = false;
    self[$$root] =
      self.constructor !== klass ? null : isLight ? self : self.attachShadow({mode: 'open'});
    self[$$valid] = true;
  });

  // Deferring custom element definition allows to run it at the end of all
  // decorators execution which helps to fix many issues connected with
  // immediate custom element instance creation during definition.
  queueMicrotask(() => {
    customElements.define(name, klass, builtin && {extends: builtin});
  });
};

export default element;
