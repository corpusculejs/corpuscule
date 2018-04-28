export interface Constructor<T> {
  new (...args: any[]): T; // tslint:disable-line:readonly-array
}

// tslint:disable:no-method-signature
export interface CustomElementBase extends HTMLElement {
  attributeChangedCallback?(attrName: string, oldVal: string, newVal: string): void;
  connectedCallback?(): void;
  disconnectedCallback?(): void;
  adoptedCallback?(): void;
}
// tslint:enable:no-method-signature

export type PropertyGetter<S> = (state: S) => any;
export type ReduxDecorator = (target: any) => any;
export type StoredDecorator<S> = (getter: PropertyGetter<S>) => (prototype: any, propertyName: string) => void;
export type DispatcherDecorator = (prototype: any, propertyName: string) => any;
