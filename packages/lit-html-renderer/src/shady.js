import {render} from 'lit-html/lib/shady-render';

const renderLitHtml = (result, container, context) => {
  render(result, container, {
    eventContext: context,
    scopeName: context.localName,
  });
};

export default renderLitHtml;
