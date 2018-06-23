// tslint:disable-next-line:max-line-length readonly-keyword
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export interface CustomElement extends HTMLElement {
  attributeChangedCallback?(attrName: string, oldVal: string, newVal: string): void;

  connectedCallback?(): void;

  disconnectedCallback?(): void;

  adoptedCallback?(): void;
}

export interface CustomElementClass<T> {
  readonly is: string;
  new (...args: any[]): CustomElement & T; // tslint:disable-line:readonly-array
}

export type UncertainCustomElementClass<T> = CustomElementClass<T> | Omit<CustomElementClass<T>, "is">;
