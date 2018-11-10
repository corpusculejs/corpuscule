// tslint:disable:no-unnecessary-class

import {html, render} from 'lit-html';
import {unsafeStatic, withCorpusculeElement} from '../src';

const testWithCorpusculeElement = () => {
  describe('withCorpusculeElement', () => {
    let container: HTMLElement;
    let chtml: typeof html;

    beforeEach(() => {
      container = document.createElement('div');
      chtml = withCorpusculeElement(html);
    });

    describe('withUnsafeStatic', () => {
      it('renders static values into template', () => {
        const tag = unsafeStatic('div');
        const cls = unsafeStatic('class');
        const template = chtml`<${tag} ${cls}="test"></${tag}>`;
        render(template, container);

        expect(container.innerHTML).toContain('<div class="test"></div>');
      });

      it('handles nesting', () => {
        const div = unsafeStatic('div');
        const span = unsafeStatic('span');
        const cls = unsafeStatic('class');
        const template = chtml`<${div}><${span} ${cls}="test">Test</${span}></${div}>`;
        render(template, container);

        expect(container.innerHTML).toContain('<div><span class="test">Test</span></div>');
      });

      it('throws an error if static value is changed to dynamic', () => {
        let text: any = unsafeStatic('Test');
        const template = () => chtml`<div>${text}</div>`;
        render(template(), container);

        text = 'New Test';

        expect(() => render(template(), container)).toThrow();
      });

      it('ignores if one static value is changed to another', () => {
        let text = unsafeStatic('Test');
        const template = () => chtml`<div>${text}</div>`;
        render(template(), container);

        text = unsafeStatic('New Test');
        render(template(), container);

        expect(container.innerHTML).toContain('<div>Test</div>');
      });
    });

    it('accepts Corpuscule element class as a tag name', () => {
      class Test {
        public static readonly is: string = 'x-test';
        public static readonly isCorpusculeElement: boolean = true;
      }

      const template = chtml`<${Test}>Test</${Test}>`;
      render(template, container);

      expect(container.innerHTML).toContain('<x-test>Test</x-test>');
    });
  });
};

export default testWithCorpusculeElement;
