export type Exact<T extends U, U> = {
  [P in keyof T]: P extends keyof U ? T[P] : never;
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
  ): void;
  connectedCallback?(this: CustomElement): void;
  disconnectedCallback?(this: CustomElement): void;
  adoptedCallback?(this: CustomElement): void;
}

export type BabelPropertyDescriptor<T = unknown> = PropertyDescriptor & {
  initializer?: () => T;
};

export type Initializer = (self: any) => void;
export type Registration = () => void;

export type DecoratedClassProperties = {
  __initializers: Initializer[];
  __registrations: Registration[];
};

export type DecoratedClassConstructor<
  C,
  P extends object = Object,
  S extends object = {}
> = Constructor<C, P, DecoratedClassProperties & S>;

export type DecoratedClassPrototype<
  C,
  P extends object = Object,
  S extends object = {}
> = {
  constructor: DecoratedClassConstructor<C, P, S>;
};
