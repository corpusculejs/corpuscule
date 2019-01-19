import {TemplateResult} from 'lit-html';

declare const renderShady: (
  result: TemplateResult,
  root: Element | DocumentFragment,
  context: unknown,
) => void;

export default renderShady;
