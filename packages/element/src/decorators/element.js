/* eslint-disable no-invalid-this, prefer-arrow-callback */
import assertKind from '@corpuscule/utils/lib/assertKind';
import getSuperMethod from '@corpuscule/utils/lib/getSuperMethod';
import {render as renderer} from 'lit-html';
import scheduler from '../scheduler';
import {
  createRoot as $createRoot,
  updatedCallback as $updatedCallback,
  propertyChangedCallback as $propertyChangedCallback,
  render as $render,
  renderer as $renderer,
  scheduler as $scheduler,
  stateChangedCallback as $stateChangedCallback,
} from '../tokens/lifecycle';
import {
  connected as $$connected,
  invalidate as $$invalidate,
  root as $$root,
  valid as $$valid,
} from '../tokens/internal';
import {
  method,
  privateField,
  privateMethod,
  readonlyField,
  toStatic,
} from '@corpuscule/utils/lib/descriptors';
import {unsafeStatic} from '../withUnsafeStatic';

export const corpusculeElements = new WeakMap();
const connectedCallbackKey = 'connectedCallback';
const attributeChangedCallbackKey = 'attributeChangedCallback';

// eslint-disable-next-line no-empty-function
const noop = () => {
};

const element = name => ({kind, elements}) => {
  assertKind('element', 'class', kind);

  const superAttributeChangedCallback = getSuperMethod(attributeChangedCallbackKey, elements);
  const superConnectedCallback = getSuperMethod(connectedCallbackKey, elements);
  const superPropertyChangedCallback = getSuperMethod($propertyChangedCallback, elements);
  const superStateChangedCallback = getSuperMethod($stateChangedCallback, elements);

  if (!elements.find(({key}) => key === $render)) {
    throw new Error('[render]() is not implemented');
  }

  const fallbacks = [];

  if (!elements.find(({key}) => key === $renderer)) {
    fallbacks.push(toStatic(readonlyField({
      initializer: () => renderer,
      key: $renderer,
    })));
  }

  if (!elements.find(({key}) => key === $scheduler)) {
    fallbacks.push(toStatic(readonlyField({
      initializer: () => scheduler,
      key: $scheduler,
    })));
  }

  if (!elements.find(({key}) => key === $updatedCallback)) {
    fallbacks.push(method({
      key: $updatedCallback,
      value: noop,
    }));
  }

  if (!elements.find(({key}) => key === $createRoot)) {
    fallbacks.push(method({
      key: $createRoot,
      value() {
        return this.attachShadow({mode: 'open'});
      },
    }));
  }

  return {
    elements: [
      ...elements.filter(({key}) =>
        key !== 'is'
        && key !== attributeChangedCallbackKey
        && key !== connectedCallbackKey
        && key !== $propertyChangedCallback
        && key !== $stateChangedCallback,
      ),
      ...fallbacks,
      {
        descriptor: {
          configurable: true,
          enumerable: true,
          get() {
            return name;
          },
        },
        key: 'is',
        kind: 'method',
        placement: 'static',
      },
      privateField({
        initializer: () => false,
        key: $$connected,
      }),
      privateField({
        initializer: () => true,
        key: $$valid,
      }),
      privateField({
        initializer() {
          return this[$createRoot]();
        },
        key: $$root,
      }),
      method({
        key: connectedCallbackKey,
        value() {
          if (superConnectedCallback) {
            superConnectedCallback.call(this);
          }

          this[$$invalidate]();
        },
      }),
      method({
        key: attributeChangedCallbackKey,
        value(attributeName, oldValue, newValue) {
          if (oldValue === newValue || !this[$$connected]) {
            return;
          }

          if (superAttributeChangedCallback) {
            superAttributeChangedCallback.call(this, attributeName, oldValue, newValue);
          }

          this[$$invalidate]();
        },
      }),
      method({
        key: $propertyChangedCallback,
        value(propertyName, oldValue, newValue) {
          if (oldValue === newValue || !this[$$connected]) {
            return;
          }

          if (superPropertyChangedCallback) {
            superPropertyChangedCallback.call(this, propertyName, oldValue, newValue);
          }

          this[$$invalidate]();
        },
      }),
      method({
        key: $stateChangedCallback,
        value(stateName, oldValue, newValue) {
          if (!this[$$connected]) {
            return;
          }

          if (superStateChangedCallback) {
            superStateChangedCallback.call(this, stateName, oldValue, newValue);
          }

          this[$$invalidate]();
        },
      }),
      privateMethod({
        key: $$invalidate,
        value() {
          if (!this[$$valid]) {
            return;
          }

          const {
            [$renderer]: render,
            [$scheduler]: schedule,
          } = this.constructor;

          this[$$valid] = false;

          schedule(() => {
            const rendered = this[$render]();

            if (rendered) {
              render(rendered, this[$$root]);
            }

            const shouldRunUpdatedCallback = this[$$connected];

            this[$$connected] = true;
            this[$$valid] = true;

            if (shouldRunUpdatedCallback) {
              this[$updatedCallback]();
            }
          });
        },
      }),
    ],
    finisher(target) {
      customElements.define(name, target);
      corpusculeElements.set(target, unsafeStatic(name));
    },
    kind,
  };
};

export default element;
