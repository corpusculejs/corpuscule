// tslint:disable:max-classes-per-file
import {render as litHtmlRender, TemplateResult} from 'lit-html';

export interface ComputingPair {
  readonly computer: MethodDecorator;
  readonly observer: PropertyDecorator;
}

export type ElementRenderer = typeof litHtmlRender;
export type ElementScheduler = (callback: () => void) => Promise<void>;

export type AttributeGuard = BooleanConstructor | NumberConstructor | StringConstructor;
export type PropertyGuard = (value: unknown) => boolean;

export const attribute: (attributeName: string, guard: AttributeGuard) => PropertyDecorator;
export const element: (name: string) => ClassDecorator;
export const property: (guard?: PropertyGuard) => PropertyDecorator;
export const state: PropertyDecorator;

export const createComputingPair: () => ComputingPair;

export const createRoot: unique symbol;
export const updatedCallback: unique symbol;
export const propertyChangedCallback: unique symbol;
export const render: unique symbol;
export const renderer: unique symbol;
export const scheduler: unique symbol;
export const stateChangedCallback: unique symbol;

export class UnsafeStatic {
  public readonly value: unknown;

  public constructor(value: unknown);
}

export const unsafeStatic: (value: unknown) => UnsafeStatic;

export const withCorpusculeElement:
  // tslint:disable-next-line:readonly-array
  (processor: (strings: TemplateStringsArray, ...values: any[]) => TemplateResult) =>
    // tslint:disable-next-line:readonly-array
    (strings: TemplateStringsArray, ...values: any[]) => TemplateResult;
