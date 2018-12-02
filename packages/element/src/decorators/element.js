/* eslint-disable no-invalid-this, prefer-arrow-callback */
import {assertKind} from '@corpuscule/utils/lib/asserts';
import getSuperMethods from '@corpuscule/utils/lib/getSuperMethods';
import {render as renderer} from 'lit-html';
import scheduler from '../scheduler';
import {
  createRoot as $createRoot,
  updatedCallback as $updatedCallback,
  propertyChangedCallback as $propertyChangedCallback,
  render as $render,
  renderer as $renderer,
  scheduler as $scheduler,
  internalChangedCallback as $internalChangedCallback,
} from '../tokens/lifecycle';
import {field, method} from '@corpuscule/utils/lib/descriptors';

const attributeChangedCallbackKey = 'attributeChangedCallback';
const connectedCallbackKey = 'connectedCallback';
const isCorpusculeElementKey = 'isCorpusculeElement';

// eslint-disable-next-line no-empty-function
const noop = () => {};

const fields = [
  $renderer,
  $scheduler,
];

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
  ...fields,
  ...methods,
];

const element = name => ({kind, elements}) => {
  assertKind('element', 'class', kind);

  if (!elements.find(({key}) => key === $render)) {
    throw new Error('[render]() is not implemented');
  }

  const $$connected = Symbol();
  const $$invalidate = Symbol();
  const $$root = Symbol();
  const $$valid = Symbol();

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

  const [
    {initializer: existingRenderer = () => renderer} = {},
    {initializer: existingScheduler = () => scheduler} = {},
  ] = fields.map(fieldName => elements.find(({key}) => key === fieldName));

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
        initializer: existingRenderer,
        key: $renderer,
      }, {isReadonly: true, isStatic: true}),
      field({
        initializer: existingScheduler,
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
        value: superCreateRoot,
      }),
      method({
        key: $internalChangedCallback,
        value(internalName, oldValue, newValue) {
          if (!this[$$connected]) {
            return;
          }

          superInternalChangedCallback.call(this, internalName, oldValue, newValue);
          this[$$invalidate]();
        },
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
        key: $updatedCallback,
        value: superUpdatedCallback,
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
