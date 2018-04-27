import UniversalRouter, {Params} from 'universal-router';
import generate, {Options} from 'universal-router/generateUrls';
import {RoutePush} from './index';

export interface Constructor<T> {
  new (...args: any[]): T; // tslint:disable-line:readonly-array
}

export interface CustomElementBaseIdentifier {
  readonly is: string;
}

// tslint:disable:no-method-signature
export interface CustomElementBase extends HTMLElement {
  attributeChangedCallback?(attrName: string, oldVal: string, newVal: string): void;
  connectedCallback?(): void;
  disconnectedCallback?(): void;
  adoptedCallback?(): void;
}
// tslint:enable:no-method-signature

export interface LocationDescriptor {
  readonly routeName: string;
  readonly params: Params;
}

export type UrlUtilsCreator = (name: string, opts?: Options) => [
  Constructor<CustomElementBase> & CustomElementBaseIdentifier,
  (routeName: string, params: Params) => string
];

const createUrlUtilsCreator = (router: UniversalRouter, push: RoutePush): UrlUtilsCreator =>
  (name, options) => {
    const createUrl = generate(router, options);

    class Link extends HTMLElement implements CustomElementBase {
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

      public get to(): string | LocationDescriptor {
        return this.__to;
      }

      public set to(value: string | LocationDescriptor) {
        this.__to = typeof value === 'string'
          ? value
          : createUrl(value.routeName, value.params);
        this.setAttribute('to', this.__to);
      }

      private __handleClick = (e: Event) => {
        e.preventDefault();
        push(this.__to);
      };
    }

    customElements.define(name, Link);

    return [Link, createUrl];
  };

export default createUrlUtilsCreator;
