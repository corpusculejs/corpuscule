/* eslint-disable max-classes-per-file, class-methods-use-this, no-empty-function */

export const mount = (elementOrName, beforeMount = () => undefined) => {
  const el = document.createElement(
    typeof elementOrName === 'string'
      ? elementOrName
      : elementOrName.is,
  );
  beforeMount(el);
  document.body.appendChild(el);

  return el;
};

export const defineAndMount = (element, beforeMount) => {
  customElements.define(element.is, element);

  return mount(element, beforeMount);
};

export const defineAndMountContext = (provider, ...consumers) => {
  const list = new Array(consumers.length);
  const fragment = document.createDocumentFragment();

  customElements.define(provider.is, provider);
  const providerElement = document.createElement(provider.is);

  for (let i = 0; i < consumers.length; i++) {
    const consumer = consumers[i];
    customElements.define(consumer.is, consumer);

    const consumerElement = document.createElement(consumer.is);
    list[i] = consumerElement;

    const div = document.createElement('div');
    div.appendChild(consumerElement);

    fragment.appendChild(div);
  }

  providerElement.consumers = fragment;
  document.body.appendChild(providerElement);

  return [providerElement, ...list];
};

export class BasicConsumer extends HTMLElement {
}

export class BasicProvider extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
  }

  connectedCallback() {
    this.shadowRoot.appendChild(this.consumers);
  }
}

export class HTMLElementMock {
  constructor() {
    this.attributes = new Map();
    this.listeners = new Map();
    this.nestingChain = [this];
    this.shadowMock = document.createElement('div');
  }

  addEventListener(eventName, listener) {
    if (this.listeners.has(eventName)) {
      this.listeners.get(eventName).push(listener);
    } else {
      this.listeners.set(eventName, [listener]);
    }
  }

  addParent(parent) {
    this.nestingChain.push(parent);
  }

  attachShadow() {
    return this.shadowMock;
  }

  attributeChangedCallback() {
  }

  connectedCallback() {
  }

  disconnectedCallback() {
  }

  dispatchEvent(event) {
    for (const {listeners} of this.nestingChain) {
      for (const listener of listeners.get(event.type)) {
        listener(event);
      }
    }
  }

  getAttribute(key) {
    return this.attributes.has(key)
      ? this.attributes.get(key)
      : null;
  }

  hasAttribute(key) {
    return this.attributes.has(key);
  }

  removeAttribute(key) {
    this.attributes.delete(key);
  }

  removeEventListener() {}

  setAttribute(key, value) {
    const v = String(value);
    this.attributeChangedCallback(
      key,
      this.attributes.has(key)
        ? this.attributes.get(key)
        : null,
      v,
    );
    this.attributes.set(key, v);
  }
}
