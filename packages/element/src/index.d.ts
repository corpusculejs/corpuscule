// tslint:disable:max-classes-per-file
import {CustomElement} from "@corpuscule/typings";
import {TemplateResult} from "lit-html";

export interface ComputingPair {
  readonly computed: (deriver?: (value: unknown) => unknown) => MethodDecorator;
  readonly observer: PropertyDecorator;
}

export type AttributeGuard = BooleanConstructor | NumberConstructor | StringConstructor;
export type PropertyGuard = (value: unknown) => boolean;

export const attribute: (attributeName: string, guard: AttributeGuard) => PropertyDecorator;
export const element: (name: string) => ClassDecorator;
export const property: (guard?: PropertyGuard) => PropertyDecorator;
export const state: PropertyDecorator;

export const createComputingPair: () => ComputingPair;

export const createRoot: unique symbol;
export const didUpdate: unique symbol;
export const propertyChangedCallback: unique symbol;
export const render: unique symbol;
export const shouldUpdate: unique symbol;
export const stateChangedCallback: unique symbol;

export class UnsafeStatic {
  public readonly value: unknown;
  public constructor(value: unknown);
}

export const unsafeStatic: (value: unknown) => UnsafeStatic;

// tslint:disable-next-line:array-type readonly-array
export const dhtml: (strings: ReadonlyArray<string>, ...values: unknown[]) => TemplateResult;

export default class CorpusculeElement extends HTMLElement implements CustomElement {
  public static readonly is: string;
  public static readonly tag: UnsafeStatic;
  public static readonly observableAttributes: ReadonlyArray<PropertyKey>;

  public readonly elementRendering: Promise<void>;
  protected readonly [shouldUpdate]: boolean;

  public attributeChangedCallback(attrName: string, oldVal: string, newVal: string): Promise<void>;

  public connectedCallback(): Promise<void>;

  public disconnectedCallback(): void;

  public forceUpdate(): Promise<void>;

  protected [createRoot](): Element | DocumentFragment;

  protected [didUpdate](): void;

  protected [propertyChangedCallback]<K extends keyof this, V extends this[K]>(propertyName: K, oldValue: V, newValue: V): void;

  protected [render](): TemplateResult | null;

  protected [stateChangedCallback](propertyName: keyof this, oldValue: unknown, newValue: unknown): void;
}
