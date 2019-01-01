import {TemplateResult} from 'lit-html';

declare const renderLitHtml: (
  result: TemplateResult,
  root: Element | DocumentFragment,
  context: unknown,
) => void;

export default renderLitHtml;
