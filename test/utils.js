/* eslint-disable class-methods-use-this, max-classes-per-file, no-empty-function */
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

  attributeChangedCallback() {}

  connectedCallback() {}

  disconnectedCallback() {}

  dispatchEvent(event) {
    for (const {listeners} of this.nestingChain) {
      const list = listeners.get(event.type);

      if (!list) {
        continue;
      }

      for (const listener of list) {
        listener(event);
      }
    }
  }

  getAttribute(key) {
    return this.attributes.has(key) ? this.attributes.get(key) : null;
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
      this.attributes.has(key) ? this.attributes.get(key) : null,
      v,
    );
    this.attributes.set(key, v);
  }
}

export class CustomElement extends HTMLElement {
  attributeChangedCallback() {}

  connectedCallback() {}

  disconnectedCallback() {}
}

export const genName = () => {
  const arr = new Uint32Array(2);
  const [rnd1, rnd2] = crypto.getRandomValues(arr);

  return `x-${rnd1}${rnd2}`;
};

export const createTestingPromise = () => {
  let resolve;
  const promise = new Promise(r => {
    resolve = r;
  });

  return [promise, resolve];
};
