/* eslint-disable no-invalid-this, prefer-arrow-callback */
import {assertKind} from '@corpuscule/utils/lib/asserts';
import getSuperMethods from '@corpuscule/utils/lib/getSuperMethods';
import {field, lifecycleKeys, method} from '@corpuscule/utils/lib/descriptors';
import {render as defaultRenderer} from 'lit-html';
import defaultScheduler from '../scheduler';
import {
  createRoot as $createRoot,
  updatedCallback as $updatedCallback,
  propertyChangedCallback as $propertyChangedCallback,
  render as $render,
  internalChangedCallback as $internalChangedCallback,
} from '../tokens/lifecycle';

const attributeChangedCallbackKey = 'attributeChangedCallback';
const [connectedCallbackKey] = lifecycleKeys;
const isCorpusculeElementKey = 'isCorpusculeElement';

// eslint-disable-next-line no-empty-function
const noop = () => {};

const methods = [
  attributeChangedCallbackKey,
  connectedCallbackKey,
  $createRoot,
  $internalChangedCallback,
  $propertyChangedCallback,
  $updatedCallback,
];

const filteringNames = [
  'is',
  isCorpusculeElementKey,
  ...methods,
];

const connectedMap = new WeakMap();
const rendererMap = new WeakMap();
const rootMap = new WeakMap();
const schedulerMap = new WeakMap();
const validMap = new WeakMap();

const invalidate = (self) => {
  if (!validMap.get(self)) {
    return;
  }

  validMap.set(self, false);

  schedulerMap.get(self.constructor)(() => {
    const rendered = self[$render]();

    if (rendered) {
      rendererMap.get(self.constructor)(rendered, rootMap.get(self), {eventContext: self});
    }

    const shouldRunUpdatedCallback = connectedMap.get(self);

    connectedMap.set(self, true);
    validMap.set(self, true);

    if (shouldRunUpdatedCallback) {
      self[$updatedCallback]();
    }
  });
};

const element = (
  name,
  {renderer = defaultRenderer, scheduler = defaultScheduler} = {},
) => ({kind, elements}) => {
  assertKind('element', 'class', kind);

  if (!elements.find(({key}) => key === $render)) {
    throw new Error('[render]() is not implemented');
  }

  const [
    superAttributeChangedCallback,
    superConnectedCallback,
    superCreateRoot,
    superInternalChangedCallback,
    superPropertyChangedCallback,
    superUpdatedCallback,
  ] = getSuperMethods(elements, methods, {
    [$createRoot]() {
      return this.attachShadow({mode: 'open'});
    },
    [$updatedCallback]: noop,
  });

  return {
    elements: [
      ...elements.filter(({key}) => !filteringNames.includes(key)),

      // Static
      field({
        initializer: () => name,
        key: 'is',
      }, {isReadonly: true, isStatic: true}),
      field({
        initializer: () => true,
        key: isCorpusculeElementKey,
      }, {isReadonly: true, isStatic: true}),
      field({
        initializer: () => [],
        key: 'observedAttributes',
      }, {isReadonly: true, isStatic: true}),

      // Public
      method({
        key: connectedCallbackKey,
        value() {
          superConnectedCallback.call(this);
          invalidate(this);
        },
      }),
      method({
        key: attributeChangedCallbackKey,
        value(attributeName, oldValue, newValue) {
          if (oldValue === newValue || !connectedMap.get(this)) {
            return;
          }

          superAttributeChangedCallback.call(this, attributeName, oldValue, newValue);
          invalidate(this);
        },
      }),

      // Protected
      method({
        key: $createRoot,
        value: superCreateRoot,
      }),
      method({
        key: $internalChangedCallback,
        value(internalName, oldValue, newValue) {
          if (!connectedMap.get(this)) {
            return;
          }

          superInternalChangedCallback.call(this, internalName, oldValue, newValue);
          invalidate(this);
        },
      }),
      method({
        key: $propertyChangedCallback,
        value(propertyName, oldValue, newValue) {
          if (oldValue === newValue || !connectedMap.get(this)) {
            return;
          }

          superPropertyChangedCallback.call(this, propertyName, oldValue, newValue);
          invalidate(this);
        },
      }),
      method({
        key: $updatedCallback,
        value: superUpdatedCallback,
      }),

      // Initializer
      field({
        initializer() {
          connectedMap.set(this, false);
          rootMap.set(this, this[$createRoot]());
          validMap.set(this, true);
        },
      }),
    ],
    finisher(target) {
      customElements.define(name, target);
      rendererMap.set(target, renderer);
      schedulerMap.set(target, scheduler);
    },
    kind,
  };
};

export default element;
