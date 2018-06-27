import {CustomElement} from "@corpuscule/typings";
import {TemplateResult} from "lit-html";

export interface PropertyOptions {
  readonly pure?: boolean;
}

export type AttributeGuard = BooleanConstructor | NumberConstructor | StringConstructor;
export type AttributeDescriptor =
  | [string, AttributeGuard]
  | [string, AttributeGuard, PropertyOptions];

export type ComputedDescriptor = ReadonlyArray<PropertyKey>;

export type PropertyGuard = (value: any) => boolean;
export type PropertyDescriptor =
  | [PropertyGuard, PropertyOptions]
  | PropertyGuard
  | null;

export type AttributeDescriptorMap<T extends CorpusculeElement = any> = {
  readonly [P in Exclude<keyof T, keyof CorpusculeElement>]?: AttributeDescriptor;
};

export type ComputedDescriptorMap<T extends CorpusculeElement = any> = {
  readonly [P in Exclude<keyof T, keyof CorpusculeElement>]?: ComputedDescriptor;
};

export type PropertyDescriptorMap<T extends CorpusculeElement = any> = {
  readonly [P in Exclude<keyof T, keyof CorpusculeElement>]?: PropertyDescriptor;
};

// TODO: fix when Microsoft/TypeScript#24897 is merged (if possible)
export type StateDescriptorMap<T extends CorpusculeElement = any> = ReadonlyArray<PropertyKey>;

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

  public static readonly observableAttributes: ReadonlyArray<PropertyKey>;

  public static readonly [attributeMap]?: AttributeDescriptorMap;
  public static readonly [propertyMap]?: PropertyDescriptorMap;
  public static readonly [stateMap]?: StateDescriptorMap;
  public static readonly [computedMap]?: ComputedDescriptorMap;

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
