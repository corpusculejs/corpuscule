export const link: (url: string, base: string) => string;

export const style: unique symbol;

// tslint:disable-next-line:readonly-array
declare const styles: <T extends string[]>(...pathsOrStyles: T) => ClassDecorator;

export default styles;
