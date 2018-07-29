import {CustomElementClass} from "@corpuscule/typings";
import {TemplateResult} from "lit-html";

export const link: (url: string, base: string) => string;

export const style: unique symbol;

export interface StylesClass<T> extends CustomElementClass<T> {
  readonly [style]: TemplateResult;
}

// tslint:disable-next-line:readonly-array
declare const styles: <T extends string[]>(...pathsOrStyles: T) => ClassDecorator;

export default styles;
