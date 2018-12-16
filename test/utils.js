/* eslint-disable class-methods-use-this, no-empty-function */
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

export const createTestingPromise = () => {
  let resolve;
  const promise = new Promise(r => {
    resolve = r;
  });

  return [promise, resolve];
};
