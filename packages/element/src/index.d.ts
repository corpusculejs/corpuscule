// tslint:disable:max-classes-per-file
import {render as litHtmlRender, TemplateResult} from 'lit-html';

export interface ComputingPair {
  readonly computer: MethodDecorator;
  readonly observer: PropertyDecorator;
}

export interface ElementDecoratorParams {
  readonly renderer?: typeof litHtmlRender;
  readonly scheduler?: (callback: () => void) => Promise<void>;
}

export type AttributeGuard = BooleanConstructor | NumberConstructor | StringConstructor;
export type PropertyGuard = (value: unknown) => boolean;

export const attribute: (attributeName: string, guard: AttributeGuard) => PropertyDecorator;
export const element: (name: string, params?: ElementDecoratorParams) => ClassDecorator;
export const internal: PropertyDecorator;
export const property: (guard?: PropertyGuard) => PropertyDecorator;

export const createComputingPair: () => ComputingPair;

export const createRoot: unique symbol;
export const internalChangedCallback: unique symbol;
export const propertyChangedCallback: unique symbol;
export const render: unique symbol;
export const updatedCallback: unique symbol;

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
