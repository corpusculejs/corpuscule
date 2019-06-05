export const stylesAttachedCallback: unique symbol;

export interface StylesDecoratorOptions {
  readonly adoptedStyleSheets: boolean;
  readonly shadyCSS: boolean;
}

export const stylesAdvanced: <T extends Array<string | URL>>(
  options: StylesDecoratorOptions,
  ...pathsOrStyles: T
) => ClassDecorator;

declare const styles: <T extends Array<string | URL>>(...pathsOrStyles: T) => ClassDecorator;
export default styles;
