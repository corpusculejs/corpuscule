import {render} from 'lit-html/lib/shady-render';

const renderShady = (result, container, context) => {
  render(result, container, {
    eventContext: context,
    scopeName: context.localName,
  });
};

export default renderShady;
