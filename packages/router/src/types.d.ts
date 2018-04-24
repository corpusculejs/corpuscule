import {Params} from 'universal-router';
import {Options as UrlCreatorOptions} from 'universal-router/generateUrls';

export interface Constructor<T> {
  new (...args: any[]): T; // tslint:disable-line:readonly-array
}

export interface LocationDescriptor {
  readonly routeName: string;
  readonly params: Params;
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

// export type RouterMixin = <T extends Constructor<CustomElementBase>>(base: T) => T;
export type RouterMixin = <T extends Constructor<CustomElementBase>>(base: T) => T;
export type RouterPush = (path: string, title?: string) => void;
export type RouteDataDecorator = (target: any, propertyName: string) => void;
export type CreateLinkElementAndUrlConstructor = (name: string, opts?: UrlCreatorOptions) => [
  Constructor<CustomElementBase> & CustomElementBaseIdentifier,
  (routeName: string, params: Params) => string
];
