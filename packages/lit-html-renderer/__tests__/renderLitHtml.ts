// tslint:disable:no-object-literal-type-assertion
import {html} from 'lit-html';
import {render} from '../../../test/mocks/litHtml';
import renderLitHtml from '../src';

const testRenderLitHtml = () => {
  describe('renderLitHtml', () => {
    beforeEach(() => {
      render.calls.reset();
    });

    it('renders lit-html template result', () => {
      const result = html`
        <div>Test</div>
      `;
      const container = document.createElement('div');
      const context = {};

      renderLitHtml(result, container, context);

      expect(render).toHaveBeenCalledWith(result, container, {
        eventContext: context,
      });
    });
  });
};

export default testRenderLitHtml;
