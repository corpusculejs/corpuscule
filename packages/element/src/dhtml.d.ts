import {TemplateResult} from "lit-html";

export class UnsafeStatic {
  public readonly value: unknown;

  public constructor(value: unknown);
}

export const unsafeStatic: (value: unknown) => UnsafeStatic;

// tslint:disable-next-line:array-type readonly-array
declare const dhtml: (strings: ReadonlyArray<string>, ...values: unknown[]) => TemplateResult;
export default dhtml;
