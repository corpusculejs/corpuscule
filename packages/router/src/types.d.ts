import {Params, Route} from 'universal-router';
import {Options} from 'universal-router/generateUrls';

export interface LinkConstructor {
  readonly is: string;
  new (...args: any[]): CustomElement; // tslint:disable-line:readonly-array
}

export interface RouterConstructor {
  readonly _routeNode?: string;
  new (...args: any[]): CustomElement; // tslint:disable-line:readonly-array
}

// tslint:disable:no-method-signature
export interface CustomElement extends HTMLElement {
  attributeChangedCallback?(attrName: string, oldVal: string, newVal: string): void;
  connectedCallback?(): void;
  disconnectedCallback?(): void;
  adoptedCallback?(): void;
} // tslint:enable:no-method-signature

export type RouterConnector = (routes: ReadonlyArray<Route>) => <T extends RouterConstructor>(target: T) => T;

export interface RouterUtils {
  readonly createUrlUtils: UrlUtilsCreator;
  readonly push: RouterPush;
}

export interface UrlUtils {
  readonly Link: LinkConstructor;
  readonly createUrl: (routeName: string, params: Params) => string;
}

export type RouterPush = (path: string, title?: string) => void;

export type UrlUtilsCreator = (name: string, opts?: Options) => UrlUtils;
