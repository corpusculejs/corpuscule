import {render} from 'lit-html';

const renderLitHtml = (result, container, context) => {
  render(result, container, {
    eventContext: context,
  });
};

export default renderLitHtml;
