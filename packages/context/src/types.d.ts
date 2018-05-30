export interface Constructor<T> {
  new (...args: any[]): T; // tslint:disable-line:readonly-array
}

export interface CustomElement extends HTMLElement {
  attributeChangedCallback?(attrName: string, oldVal: string, newVal: string): void;
  connectedCallback?(): void;
  disconnectedCallback?(): void;
  adoptedCallback?(): void;
}

export type Consume<T> = (value?: T) => void;
export type Unsubscribe<T> = (consume: Consume<T>) => void;

export interface ContextDetails<T> {
  readonly consume: Consume<T>;
  unsubscribe?: Unsubscribe<T>; // tslint:disable-line:readonly-keyword
}
