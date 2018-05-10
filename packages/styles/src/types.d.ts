// tslint:disable:no-method-signature
export interface CustomElement extends HTMLElement {
  attributeChangedCallback?(attrName: string, oldVal: string, newVal: string): void;
  connectedCallback?(): void;
  disconnectedCallback?(): void;
  adoptedCallback?(): void;
} // tslint:enable:no-method-signature

export interface StyleConstructor {
  new (...args: any[]): CustomElement; // tslint:disable-line:readonly-array
}
