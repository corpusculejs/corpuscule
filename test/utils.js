/* eslint-disable class-methods-use-this, no-empty-function */
import {defineCE, fixture} from '@open-wc/testing-helpers';

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

export const createSimpleContext = async (Provider, Consumer) => {
  const providerTag = defineCE(Provider);
  const consumerTag = defineCE(Consumer);

  const providerElement = await fixture(`
    <${providerTag}>
      <${consumerTag}></${consumerTag}>
    </${providerTag}>
  `);

  return [providerElement, providerElement.children[0]];
};

export const waitForMutationObserverChange = async (elementToObserve, options) =>
  new Promise((resolve, reject) => {
    try {
      let observer;

      const cb = () => {
        observer.disconnect();
        resolve();
      };

      observer = new MutationObserver(cb);
      observer.observe(elementToObserve, options);
    } catch (e) {
      reject(e);
    }
  });
