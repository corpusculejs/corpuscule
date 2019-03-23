export interface ElementDecoratorOptions {
  readonly extends?: keyof HTMLElementTagNameMap;
  readonly lightDOM?: boolean;
  readonly renderer: (
    result: unknown,
    container: Element | DocumentFragment,
    context: unknown,
  ) => void;
  readonly scheduler?: (callback: () => void) => Promise<void>;
}

export type AttributeGuard = BooleanConstructor | NumberConstructor | StringConstructor;
export type PropertyGuard = (value: unknown) => boolean;

export type Token = object;

export const createComputingToken: () => Token;

export const attribute: (attributeName: string, guard: AttributeGuard) => PropertyDecorator;
export const computer: (token: Token) => PropertyDecorator;
export const element: (name: string, options?: ElementDecoratorOptions) => ClassDecorator;
export const internal: PropertyDecorator;
export const observer: (token: Token) => PropertyDecorator;
export const property: (guard?: PropertyGuard) => PropertyDecorator;

export const query: (selector: string) => PropertyDecorator;
export const queryAll: (selector: string) => PropertyDecorator;

export const internalChangedCallback: unique symbol;
export const propertyChangedCallback: unique symbol;
export const render: unique symbol;
export const updatedCallback: unique symbol;
