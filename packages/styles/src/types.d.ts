// tslint:disable:no-method-signature
export interface CustomElement extends HTMLElement {
  attributeChangedCallback?(attrName: string, oldVal: string, newVal: string): void;
  connectedCallback?(): void;
  disconnectedCallback?(): void;
  adoptedCallback?(): void;
} // tslint:enable:no-method-signature

export interface Constructor<T> {
  new (...args: any[]): T; // tslint:disable-line:readonly-array
}
