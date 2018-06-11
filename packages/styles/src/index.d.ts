import {TemplateResult} from "lit-html";

export interface Constructor<T> {
  new(...args: any[]): T; // tslint:disable-line:readonly-array
}

export interface CustomElement extends HTMLElement {
  attributeChangedCallback?(attrName: string, oldVal: string, newVal: string): void;

  connectedCallback?(): void;

  disconnectedCallback?(): void;

  adoptedCallback?(): void;
}

export const link: (url: string, base: string) => string;

export const style: unique symbol;

export interface StylesStatic {
  readonly [style]: TemplateResult;
}

declare const styles:
  (...pathsOrStyles: string[]) => // tslint:disable-line:readonly-array
    <T extends Constructor<CustomElement>>(target: T) => T & StylesStatic;

export default styles;
