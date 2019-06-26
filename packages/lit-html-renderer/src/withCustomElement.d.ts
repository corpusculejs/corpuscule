import {TemplateResult} from 'lit-html';

export class UnsafeStatic {
  public readonly value: unknown;
  public constructor(value: unknown);
}

export const unsafeStatic: (value: unknown) => UnsafeStatic;

declare const withCustomElement: (
  processor: (strings: TemplateStringsArray, ...values: any[]) => TemplateResult,
) => (strings: TemplateStringsArray, ...values: any[]) => TemplateResult;

export default withCustomElement;
