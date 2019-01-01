export const stylesAttachedCallback: unique symbol;

// tslint:disable-next-line:readonly-array
export type StylesDecorator = <T extends Array<string | URL>>(
  ...pathsOrStyles: T
) => ClassDecorator;

export interface StylesDecoratorOptions {
  readonly adoptedStyleSheets: boolean;
  readonly shadyCSS: boolean;
}

export const createStylesDecorator: (options: StylesDecoratorOptions) => StylesDecorator;

declare const styles: StylesDecorator;

export default styles;
