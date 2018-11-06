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

const corpusculeElements = new WeakSet();
const connectedCallbackKey = 'connectedCallback';
const attributeChangedCallbackKey = 'attributeChangedCallback';

// eslint-disable-next-line no-empty-function
const noop = () => {};

const method = (key, value) => (
  {
    descriptor: {
      configurable: true,
      enumerable: true,
      value,
    },
    key,
    kind: 'method',
    placement: 'prototype',
  }
);

const field = (key, initializer) => ({
  descriptor: {
    writable: true,
  },
  initializer,
  key,
  kind: 'field',
  placement: 'own',
});

const staticField = (key, initializer) => ({
  descriptor: {
    configurable: true,
    enumerable: true,
  },
  initializer,
  key,
  kind: 'field',
  placement: 'static',
});

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
    fallbacks.push(staticField($renderer, () => renderer));
  }

  if (!elements.find(({key}) => key === $scheduler)) {
    fallbacks.push(staticField($scheduler, () => scheduler));
  }

  if (!elements.find(({key}) => key === $updatedCallback)) {
    fallbacks.push(method($updatedCallback, noop));
  }

  if (!elements.find(({key}) => key === $createRoot)) {
    fallbacks.push(method($createRoot, function createRoot() {
      return this.attachShadow({mode: 'open'});
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
      field($$connected, () => false),
      field($$valid, () => true),
      field($$root, function initializer() {
        return this[$createRoot]();
      }),
      method(connectedCallbackKey, function connectedCallback() {
        if (superConnectedCallback) {
          superConnectedCallback.call(this);
        }

        this[$$invalidate]();
      }),
      method(
        attributeChangedCallbackKey,
        function attributeChangedCallback(attributeName, oldValue, newValue) {
          if (oldValue === newValue || !this[$$connected]) {
            return;
          }

          if (superAttributeChangedCallback) {
            superAttributeChangedCallback.call(this, attributeName, oldValue, newValue);
          }

          this[$$invalidate]();
        },
      ),
      method(
        $propertyChangedCallback,
        function propertyChangedCallback(propertyName, oldValue, newValue) {
          if (oldValue === newValue || !this[$$connected]) {
            return;
          }

          if (superPropertyChangedCallback) {
            superPropertyChangedCallback.call(this, propertyName, oldValue, newValue);
          }

          this[$$invalidate]();
        },
      ),
      method(
        $stateChangedCallback,
        function stateChangedCallback(stateName, oldValue, newValue) {
          if (!this[$$connected]) {
            return;
          }

          if (superStateChangedCallback) {
            superStateChangedCallback.call(this, stateName, oldValue, newValue);
          }

          this[$$invalidate]();
        },
      ),
      {
        descriptor: {
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
        },
        key: $$invalidate,
        kind: 'method',
        placement: 'prototype',
      },
    ],
    finisher(target) {
      customElements.define(name, target);
      corpusculeElements.add(target);
    },
    kind,
  };
};

export default element;
