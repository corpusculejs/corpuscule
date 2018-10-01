import {CustomElement} from "@corpuscule/typings";
import {TemplateResult} from "lit-html";

export interface PropertyOptions {
  readonly pure?: boolean;
}

export type AttributeGuard = BooleanConstructor | NumberConstructor | StringConstructor;
export type PropertyGuard = (value: unknown) => boolean;

export const attribute: (attributeName: string, guard: AttributeGuard, options?: PropertyOptions) => PropertyDecorator;
export const element: (name: string) => ClassDecorator;
export const property: (guard?: PropertyGuard, options?: PropertyOptions) => PropertyDecorator;
export const state: PropertyDecorator;

export const createRoot: unique symbol;
export const didMount: unique symbol;
export const didUpdate: unique symbol;
export const didUnmount: unique symbol;
export const deriveStateFromProps: unique symbol;
export const render: unique symbol;
export const shouldUpdate: unique symbol;

export default class CorpusculeElement extends HTMLElement implements CustomElement {
  public static readonly is: string;

  public static readonly observableAttributes: ReadonlyArray<PropertyKey>;

  public static [deriveStateFromProps](props: {}, states: {}): {} | null;

  public static [shouldUpdate](nextProps: {}, nextState: {}, prevProps: {}, prevState: {}): boolean;

  public readonly elementRendering: Promise<void>;

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
