import {CustomElement} from "@corpuscule/types";
import {TemplateResult} from "lit-html";

export interface PropertyOptions {
  readonly pure?: boolean;
}

export type AttributeGuard = BooleanConstructor | NumberConstructor | StringConstructor;
export type AttributeDescriptor =
  | [string, AttributeGuard]
  | [string, AttributeGuard, PropertyOptions];

export type ComputedDescriptor = ReadonlyArray<string | symbol>;

export type PropertyGuard = (value: any) => boolean;
export type PropertyDescriptor =
  | [PropertyGuard, PropertyOptions]
  | PropertyGuard
  | null;

export type AttributeDescriptorMap<T> = {
  [P in keyof T]: AttributeDescriptor;
};

export type ComputedDescriptorMap<T> = {
  [P in keyof T]: ComputedDescriptor;
};

export type PropertyDescriptorMap<T> = {
  [P in keyof T]: PropertyDescriptor;
};

export type StateDescriptorMap<T> = ReadonlyArray<keyof T>;

export const attributeMap: unique symbol;
export const computedMap: unique symbol;
export const createRoot: unique symbol;
export const didMount: unique symbol;
export const didUpdate: unique symbol;
export const didUnmount: unique symbol;
export const deriveStateFromProps: unique symbol;
export const propertyMap: unique symbol;
export const render: unique symbol;
export const shouldUpdate: unique symbol;
export const stateMap: unique symbol;

export default class CorpusculeElement extends HTMLElement implements CustomElement {
  public static readonly is: string;

  public static readonly observableAttributes: ReadonlyArray<string>;

  public static readonly [attributeMap]?: AttributeDescriptorMap<{}>;
  public static readonly [propertyMap]?: PropertyDescriptorMap<{}>;
  public static readonly [stateMap]?: StateDescriptorMap<any>;
  public static readonly [computedMap]?: ComputedDescriptorMap<{}>;

  public static [deriveStateFromProps](nextProps: {}, prevProps: {}, prevState: {}): {} | null;

  public static [shouldUpdate](nextProps: {}, nextState: {}, prevProps: {}, prevState: {}): boolean;

  public readonly renderingPromise: Promise<void>;

  public attributeChangedCallback(attrName: string, oldVal: string, newVal: string): Promise<void>;

  public connectedCallback(): Promise<void>;

  public disconnectedCallback(): void;

  public forceUpdate(): Promise<void>;

  protected [createRoot](): Element | DocumentFragment;

  protected [didMount](): void;

  protected [didUpdate](prevProperties: {}, prevStates: {}): void;

  protected [didUnmount](): void;

  protected [render](): TemplateResult | null;
}
