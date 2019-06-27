export const stylesAttachedCallback: unique symbol;

export interface StylesDecoratorOptions {
  readonly adoptedStyleSheets?: boolean;
  readonly shadyCSS?: boolean;
}

export const stylesAdvanced: (
  pathsOrStyles: Array<string | URL>,
  options?: StylesDecoratorOptions,
) => ClassDecorator;

declare const styles: (...pathsOrStyles: Array<string | URL>) => ClassDecorator;
export default styles;
