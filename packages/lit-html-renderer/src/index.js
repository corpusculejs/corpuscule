import {render} from 'lit-html';

const renderRegular = (result, container, context) => {
  render(result, container, {
    eventContext: context,
  });
};

export default renderRegular;
