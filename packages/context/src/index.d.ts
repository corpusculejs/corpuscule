export interface Constructor<T> {
  new(...args: any[]): T; // tslint:disable-line:readonly-array
}

export interface CustomElement extends HTMLElement {
  attributeChangedCallback?(attrName: string, oldVal: string, newVal: string): void;

  connectedCallback?(): void;

  disconnectedCallback?(): void;

  adoptedCallback?(): void;
}

declare const createContext: <T>(defaultValue?: T) => {
  readonly consumer: <U extends Constructor<CustomElement>>(target: U) => U;
  readonly contextValue: "contextValue"; // hack to resolve unique symbol widening
  readonly provider: <U extends Constructor<CustomElement>>(target: U) => U;
  readonly providingValue: "providingValue"; // hack to resolve unique symbol widening
};

export default createContext;
