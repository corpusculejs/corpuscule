import {TemplateResult} from 'lit-html';

declare const renderRegular: (
  result: TemplateResult,
  root: Element | DocumentFragment,
  context: unknown,
) => void;

export default renderRegular;
