// tslint:disable:no-object-literal-type-assertion
import {html} from 'lit-html/lib/shady-render';
import {render} from '../../../test/mocks/litHtmlShady';
import {genName} from '../../../test/utils';
import renderShadyLitHtml from '../src/shady';

const testShadyRender = () => {
  describe('renderShadyLitHtml', () => {
    beforeEach(() => {
      render.calls.reset();
    });

    it('renders lit-html shady template result', () => {
      const name = genName();
      class Test extends HTMLElement {}
      customElements.define(name, Test);

      const test = new Test();

      const result = html`
        <div>Test</div>
      `;
      const container = document.createElement('div');

      renderShadyLitHtml(result, container, test);

      expect(render).toHaveBeenCalledWith(result, container, {
        eventContext: test,
        scopeName: name,
      });
    });
  });
};

export default testShadyRender;
