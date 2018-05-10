export type DispatcherRegistry = ReadonlyArray<string>;
export type PropertyGetter<S> = (state: S) => any;

// tslint:disable:no-method-signature
export interface CustomElement extends HTMLElement {
  attributeChangedCallback?(attrName: string, oldVal: string, newVal: string): void;
  connectedCallback?(): void;
  disconnectedCallback?(): void;
  adoptedCallback?(): void;
} // tslint:enable:no-method-signature

export interface ReduxConstructor<S> {
  readonly _dispatchers?: DispatcherRegistry;
  readonly _stored?: {readonly [propertyName: string]: PropertyGetter<S>};
  new (...args: any[]): CustomElement; // tslint:disable-line:readonly-array
}
