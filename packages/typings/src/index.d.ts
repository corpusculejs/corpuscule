// tslint:disable:readonly-keyword readonly-array

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export interface CustomElement extends HTMLElement {
  attributeChangedCallback?(attrName: string, oldVal: string, newVal: string): void;
  connectedCallback?(): void;
  disconnectedCallback?(): void;
  adoptedCallback?(): void;
}

export interface ExtendedPropertyDescriptor {
  descriptor: PropertyDescriptor;
  extras?: ExtendedPropertyDescriptor[];
  finisher?: (target: unknown) => unknown;
  key: PropertyKey;
  kind: 'method' | 'field';
  placement: 'own' | 'prototype' | 'static';
  initializer?(): unknown;
}

export interface ClassDescriptor {
  elements: ReadonlyArray<ExtendedPropertyDescriptor>;
  kind: 'class';
}
