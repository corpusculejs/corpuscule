import UniversalRouter from 'universal-router';
import generate from 'universal-router/generateUrls';
import {
  CustomElement,
  RouterPush,
  RouterUtils,
  UrlUtilsCreator,
} from './types';

const createRouterUtils = (router: UniversalRouter): RouterUtils => {
  const push: RouterPush = (path, title = '') => {
    history.pushState({path}, title, path);
    dispatchEvent(new PopStateEvent('popstate', {state: history.state}));
  };

  const createUrlUtils: UrlUtilsCreator = (name, options) => {
    const createUrl = generate(router, options);

    class Link extends HTMLElement implements CustomElement {
      public static readonly is: string = name;
      public static readonly observedAttributes: ReadonlyArray<string> = ['to'];

      private __a: HTMLAnchorElement = document.createElement('a');
      private __to: string = '';

      public constructor() {
        super();
        const root = this.attachShadow({mode: 'open'});
        root.appendChild(this.__a);
        this.__a.appendChild(document.createElement('slot'));
      }

      public attributeChangedCallback(_attrName: string, oldVal: string, newVal: string): void {
        if (oldVal !== newVal) {
          this.__to = newVal;
          this.__a.href = this.__to;
        }
      }

      public connectedCallback(): void {
        this.__to = this.getAttribute('to') || '';
        this.__a.href = this.__to;
        this.__a.addEventListener('click', this.__handleClick);
      }

      public disconnectedCallback(): void {
        this.__a.removeEventListener('click', this.__handleClick);
      }

      public get to(): string {
        return this.__to;
      }

      public set to(value: string) {
        this.__to = value;
        this.setAttribute('to', this.__to);
      }

      private __handleClick = (e: Event) => {
        e.preventDefault();
        push(this.__to);
      };
    }

    customElements.define(name, Link);

    return {Link, createUrl};
  };

  return {createUrlUtils, push};
};

export default createRouterUtils;
