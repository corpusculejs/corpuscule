import {routeNode} from './tokens';

export interface RouterConstructor {
  readonly [routeNode]?: string;
  new (...args: any[]): CustomElement; // tslint:disable-line:readonly-array
}

// tslint:disable:no-method-signature
export interface CustomElement extends HTMLElement {
  attributeChangedCallback?(attrName: string, oldVal: string, newVal: string): void;
  connectedCallback?(): void;
  disconnectedCallback?(): void;
  adoptedCallback?(): void;
} // tslint:enable:no-method-signature

export type RouterPush = (path: string, title?: string) => void;
