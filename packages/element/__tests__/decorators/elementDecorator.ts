import {TemplateResult} from 'lit-html';

// tslint:disable:max-classes-per-file
// tslint:disable-next-line:no-implicit-dependencies
import uuid from 'uuid/v4';
import {defineAndMount} from '../../../../test/utils';
import CorpusculeElement, {dhtml, element, render} from '../../src';

const testElementDecorator = () => {
  describe('@element', () => {
    let elementName: string;

    beforeEach(() => {
      elementName = `x-${uuid()}`;
    });

    it('should define custom element', () => {
      @element(elementName)
      class Test extends HTMLElement {
      }

      expect(customElements.get(elementName)).toBe(Test);
    });

    it('should add to the class `is` static getter that contains element name', () => {
      @element(elementName)
      class Test extends HTMLElement {
        public static readonly is: string;
      }

      expect(Test.is).toBe(elementName);
    });

    it('should add to the class `tag` static getter that contains UnsafeStatic value for element', async () => {
      @element(`x-${uuid()}`)
      class Test1 extends CorpusculeElement {
        protected [render](): TemplateResult {
          return dhtml`<div>Test content</div>`;
        }
      }

      class Test2 extends CorpusculeElement {
        public static readonly is: string = elementName;

        protected [render](): TemplateResult {
          return dhtml`<${Test1.tag}/>`;
        }
      }

      const el = defineAndMount(Test2);
      await el.elementRendering;

      const inner: Test1 | null = el.shadowRoot!.querySelector(Test1.is);
      expect(inner).toEqual(jasmine.any(Test1));
      expect(inner!.shadowRoot!.textContent).toContain('Test content');
    });
  });
};

export default testElementDecorator;
