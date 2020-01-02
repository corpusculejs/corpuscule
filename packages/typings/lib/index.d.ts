export interface CustomElement extends HTMLElement {
  attributeChangedCallback?(
    attrName: string,
    oldVal: string,
    newVal: string,
  ): void;
  connectedCallback?(): void;
  disconnectedCallback?(): void;
  adoptedCallback?(): void;
}

export type Constructor<Class, StaticProperties extends object = {}> = {
  new (...args: any[]): Class;
} & StaticProperties;

export type Initializer = (self: any) => void;
export type Registration = () => void;
