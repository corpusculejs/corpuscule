/* eslint-disable no-invalid-this, prefer-arrow-callback */
import {assertKind} from '@corpuscule/utils/lib/asserts';
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
import {field, method} from '@corpuscule/utils/lib/descriptors';

const attributeChangedCallbackKey = 'attributeChangedCallback';
const connectedCallbackKey = 'connectedCallback';
const isCorpusculeElementKey = 'isCorpusculeElement';

// eslint-disable-next-line no-empty-function
const noop = () => {
};

const filteringNames = [
  'is',
  isCorpusculeElementKey,
  attributeChangedCallbackKey,
  connectedCallbackKey,
  $createRoot,
  $propertyChangedCallback,
  $renderer,
  $scheduler,
  $stateChangedCallback,
  $updatedCallback,
];

const element = name => ({kind, elements}) => {
  assertKind('element', 'class', kind);

  const superAttributeChangedCallback = getSuperMethod(attributeChangedCallbackKey, elements);
  const superConnectedCallback = getSuperMethod(connectedCallbackKey, elements);
  const superPropertyChangedCallback = getSuperMethod($propertyChangedCallback, elements);
  const superStateChangedCallback = getSuperMethod($stateChangedCallback, elements);

  if (!elements.find(({key}) => key === $render)) {
    throw new Error('[render]() is not implemented');
  }

  const existingCreateRoot = elements.find(({key}) => key === $createRoot);
  const existingRenderer = elements.find(({key}) => key === $renderer);
  const existingScheduler = elements.find(({key}) => key === $scheduler);
  const existingUpdatedCallback = elements.find(({key}) => key === $updatedCallback);

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
        initializer: existingRenderer ? existingRenderer.initializer : () => renderer,
        key: $renderer,
      }, {isReadonly: true, isStatic: true}),
      field({
        initializer: existingScheduler ? existingScheduler.initializer : () => scheduler,
        key: $scheduler,
      }, {isReadonly: true, isStatic: true}),

      // Public
      method({
        key: connectedCallbackKey,
        value() {
          superConnectedCallback.call(this);
          this[$$invalidate]();
        },
      }),
      method({
        key: attributeChangedCallbackKey,
        value(attributeName, oldValue, newValue) {
          if (oldValue === newValue || !this[$$connected]) {
            return;
          }

          superAttributeChangedCallback.call(this, attributeName, oldValue, newValue);
          this[$$invalidate]();
        },
      }),

      // Protected
      method({
        key: $createRoot,
        value() {
          return this.attachShadow({mode: 'open'});
        },
        ...existingCreateRoot ? {value: existingCreateRoot.descriptor.value} : {},
      }),
      method({
        key: $propertyChangedCallback,
        value(propertyName, oldValue, newValue) {
          if (oldValue === newValue || !this[$$connected]) {
            return;
          }

          superPropertyChangedCallback.call(this, propertyName, oldValue, newValue);
          this[$$invalidate]();
        },
      }),
      method({
        key: $stateChangedCallback,
        value(stateName, oldValue, newValue) {
          if (!this[$$connected]) {
            return;
          }

          superStateChangedCallback.call(this, stateName, oldValue, newValue);
          this[$$invalidate]();
        },
      }),
      method({
        key: $updatedCallback,
        value: existingUpdatedCallback ? existingUpdatedCallback.descriptor.value : noop,
      }),

      // Private
      field({
        initializer: () => false,
        key: $$connected,
      }, {isPrivate: true}),
      field({
        initializer: () => true,
        key: $$valid,
      }, {isPrivate: true}),
      field({
        initializer() {
          return this[$createRoot]();
        },
        key: $$root,
      }, {isPrivate: true}),
      method({
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
              render(rendered, this[$$root], {eventContext: this});
            }

            const shouldRunUpdatedCallback = this[$$connected];

            this[$$connected] = true;
            this[$$valid] = true;

            if (shouldRunUpdatedCallback) {
              this[$updatedCallback]();
            }
          });
        },
      }, {isPrivate: true}),
    ],
    finisher(target) {
      customElements.define(name, target);
    },
    kind,
  };
};

export default element;
