export const stylesAttachedCallback: unique symbol;

export interface StylesDecoratorOptions {
  readonly adoptedStyleSheets: boolean;
  readonly shadyCSS: boolean;
}

// tslint:disable-next-line:readonly-array
export const stylesAdvanced: <T extends Array<string | URL>>(
  options: StylesDecoratorOptions,
  ...pathsOrStyles: T
) => ClassDecorator;

// tslint:disable-next-line:readonly-array
declare const styles: <T extends Array<string | URL>>(...pathsOrStyles: T) => ClassDecorator;
export default styles;
