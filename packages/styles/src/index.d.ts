import {UncertainCustomElementClass} from "@corpuscule/types";
import {TemplateResult} from "lit-html";

export const link: (url: string, base: string) => string;

export const style: unique symbol;

export interface StylesStatic {
  readonly [style]: TemplateResult;
}

declare const styles:
  (...pathsOrStyles: string[]) => // tslint:disable-line:readonly-array
    <T extends UncertainCustomElementClass<T>>(target: T) => T & StylesStatic;

export default styles;
