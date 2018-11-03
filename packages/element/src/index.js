import {render} from 'lit-html';
import schedule from './scheduler';
import {
  invalidate as $$invalidate,
  mounting as $$mounting,
  rendering as $$rendering,
  root as $$root,
  valid as $$valid,
} from './tokens/internal';
import {
  createRoot as $createRoot,
  didUpdate as $didUpdate,
  propertyChangedCallback as $propertyChangedCallback,
  render as $render,
  stateChangedCallback as $stateChangedCallback,
} from './tokens/lifecycle';
import {attributes, initAttributes} from './attribute';

export {default as attribute} from './attribute';
export {default as createComputingPair} from './computed';
export {default as element} from './element';
export {default as property} from './property';
export {default as state} from './state';
export {default as dhtml, unsafeStatic, UnsafeStatic} from './dhtml';
export * from './tokens/lifecycle';

export default class CorpusculeElement extends HTMLElement {
  static get observedAttributes() {
    return attributes.get(this);
  }

  get elementRendering() {
    return this[$$rendering] || Promise.resolve();
  }

  [$$mounting] = true;
  [$$valid] = true;

  constructor() {
    super();
    this[$$root] = this[$createRoot]();
  }

  attributeChangedCallback(_, oldVal, newVal) {
    if (oldVal === newVal) {
      return;
    }

    this[$$invalidate]();
  }

  connectedCallback() {
    initAttributes(this);
    this[$$invalidate]();
  }

  // eslint-disable-next-line no-empty-function, class-methods-use-this
  disconnectedCallback() {
  }

  forceUpdate() {
    this[$$invalidate]();

    return this[$$rendering];
  }

  [$createRoot]() {
    return this.attachShadow({mode: 'open'});
  }

  // eslint-disable-next-line no-empty-function, class-methods-use-this
  [$didUpdate]() {
  }

  // eslint-disable-next-line no-empty-function, class-methods-use-this
  [$propertyChangedCallback]() {
  }

  // eslint-disable-next-line class-methods-use-this
  [$render]() {
    throw new Error('[render]() is not implemented');
  }

  // eslint-disable-next-line no-empty-function, class-methods-use-this
  [$stateChangedCallback]() {
  }

  [$$invalidate]() {
    if (!this[$$valid]) {
      return;
    }

    this[$$valid] = false;

    // Setting all component properties takes time. So it is necessary to wait until this setting
    // is over and only then component is able to update. Starting rendering after Promise.resolve()
    // allows to have single rendering even if all component properties are changed.
    this[$$rendering] = schedule(() => {
      const rendered = this[$render]();

      if (rendered) {
        render(rendered, this[$$root]);
      }

      const shouldRunDidUpdate = !this[$$mounting];

      this[$$mounting] = false;
      this[$$valid] = true;

      if (shouldRunDidUpdate) {
        this[$didUpdate]();
      }
    });
  }
}
