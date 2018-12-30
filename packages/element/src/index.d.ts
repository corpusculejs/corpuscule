// tslint:disable:max-classes-per-file
export interface ComputingPair {
  readonly computer: MethodDecorator;
  readonly observer: PropertyDecorator;
}

export interface ElementDecoratorOptions {
  readonly renderer: (
    result: unknown,
    container: Element | DocumentFragment,
    context: unknown,
  ) => void;
  readonly scheduler?: (callback: () => void) => Promise<void>;
}

export interface ElementDecoratorParams {
  readonly extends?: keyof HTMLElementTagNameMap;
}

export type ElementDecorator = (name: string, params: ElementDecoratorParams) => ClassDecorator;

export type AttributeGuard = BooleanConstructor | NumberConstructor | StringConstructor;
export type PropertyGuard = (value: unknown) => boolean;

export const attribute: (attributeName: string, guard: AttributeGuard) => PropertyDecorator;

export const createElementDecorator: (options: ElementDecoratorOptions) => ElementDecorator;

export const internal: PropertyDecorator;
export const property: (guard?: PropertyGuard) => PropertyDecorator;

export const createComputingPair: () => ComputingPair;

export const createRoot: unique symbol;
export const internalChangedCallback: unique symbol;
export const propertyChangedCallback: unique symbol;
export const render: unique symbol;
export const updatedCallback: unique symbol;
