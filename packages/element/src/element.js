/* eslint-disable no-invalid-this, prefer-arrow-callback */
import define from '@corpuscule/utils/lib/define';
import getSupers from '@corpuscule/utils/lib/getSupersNew';
import defaultScheduler from '@corpuscule/utils/lib/scheduler';
import {
  internalChangedCallback as $internalChangedCallback,
  propertyChangedCallback as $propertyChangedCallback,
  render as $render,
  updatedCallback as $updatedCallback,
} from './tokens/lifecycle';
import {applyInitializers, applyRegistrations, noop, shadowElements} from './utils';

const element = (
  name,
  {extends: builtin, lightDOM = false, renderer, scheduler = defaultScheduler} = {},
) => target => {
  const hasRender = $render in target;
  const isLight = lightDOM || (builtin && !shadowElements.includes(builtin));

  const $$attributeChangedCallback = Symbol();
  const $$connected = Symbol();
  const $$connectedCallback = Symbol();
  const $$invalidate = Symbol();
  const $$root = Symbol();
  const $$valid = Symbol();

  const supers = getSupers(target, [
    'attributeChangedCallback',
    'connectedCallback',
    $internalChangedCallback,
    $propertyChangedCallback,
    $updatedCallback,
  ]);

  const readonly = {writable: false};

  define(target, {
    is: name,
    observedAttributes: [],
  }, {
    is: readonly,
    observedAttributes: readonly,
  });

  define(target.prototype, {
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

  applyRegistrations(target.prototype);

  // Deferring custom element definition allows to run it at the end of all
  // decorators execution which helps to fix many issues connected with
  // immediate custom element instance creation during definition.
  Promise.resolve().then(() => {
    customElements.define(name, target, builtin && {extends: builtin});
  });

  // Extended constructor
  return function() {
    const instance = new target();

    // Inheritance workaround. If class is inherited, method will work in other way
    const isExtended = this.constructor !== target;

    applyInitializers(instance);

    return Object.assign(instance, {
      [$$attributeChangedCallback]: isExtended
        ? supers.attributeChangedCallback
        : async function(attributeName, oldValue, newValue) {
            if (oldValue === newValue || !this[$$connected]) {
              return;
            }

            supers.attributeChangedCallback.call(this, attributeName, oldValue, newValue);
            await this[$$invalidate]();
          },
      [$$connected]: false,
      [$$connectedCallback]: isExtended
        ? supers.connectedCallback
        : async function() {
            await this[$$invalidate]();
            this[$$connected] = true;
            supers.connectedCallback.call(this);
          },
      [$$root]: isExtended ? (isLight ? this : this.attachShadow({mode: 'open'})) : null,
      [$$valid]: true,
    });
  };
};

export default element;
