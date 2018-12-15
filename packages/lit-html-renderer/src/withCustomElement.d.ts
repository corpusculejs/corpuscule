import {TemplateResult} from 'lit-html';

export class UnsafeStatic {
  public readonly value: unknown;
  public constructor(value: unknown);
}

export const unsafeStatic: (value: unknown) => UnsafeStatic;

declare const withCustomElement: // tslint:disable-next-line:readonly-array
(
  processor: (
    strings: TemplateStringsArray,
    ...values: any[] // tslint:disable-line:readonly-array
  ) => TemplateResult,
) => (strings: TemplateStringsArray, ...values: any[]) => TemplateResult; // tslint:disable-line:readonly-array

export default withCustomElement;
