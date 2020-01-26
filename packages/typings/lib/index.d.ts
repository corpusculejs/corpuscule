export type HTMLRoot = HTMLElement | DocumentFragment | ShadowRoot;

export type Exact<T extends U, U> = {
  [P in keyof T]: U[P] extends never ? never : T[P];
};

export type Replace<T, U> = {
  [P in keyof T]: U;
};

export type Constructor<C, P extends object = Object, S extends object = {}> = {
  new (...args: any[]): C;
  readonly prototype: P;
} & S;

export interface CustomElement extends HTMLElement {
  attributeChangedCallback?(
    this: CustomElement,
    attrName: string,
    oldVal: string,
    newVal: string,
  ): void | Promise<void>;

  connectedCallback?(this: CustomElement): void | Promise<void>;
  disconnectedCallback?(this: CustomElement): void | Promise<void>;
  adoptedCallback?(this: CustomElement): void | Promise<void>;
}

export type CustomElementClassProperties = {
  readonly observedAttributes: string[];
};

export type BabelPropertyDescriptor<T = unknown> = PropertyDescriptor & {
  initializer?: () => T;
};

export type Initializer<S = any> = (self: S) => void;
export type Registration = () => void;

export type DecoratedClassProperties<C = any> = {
  __initializers: Initializer<C>[];
  __registrations: Registration[];
};
