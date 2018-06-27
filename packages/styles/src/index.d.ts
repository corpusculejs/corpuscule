import {CustomElementClass, UncertainCustomElementClass} from "@corpuscule/typings";
import {TemplateResult} from "lit-html";

export const link: (url: string, base: string) => string;

export const style: unique symbol;

export interface StylesClass<T> extends CustomElementClass<T> {
  readonly [style]: TemplateResult;
}

declare const styles:
  (...pathsOrStyles: string[]) => // tslint:disable-line:readonly-array
    <T>(target: UncertainCustomElementClass<T>) => StylesClass<T>;

export default styles;
