// tslint:disable:await-promise max-classes-per-file
import {TemplateResult} from 'lit-html';
// tslint:disable-next-line:no-implicit-dependencies
import uuid from 'uuid/v4';
import {defineAndMount} from '../../../test/utils';
import CorpusculeElement, {dhtml, render, unsafeStatic} from '../src';

const testDhtml = () => {
  describe('dhtml', () => {
    it('should render CorpusculeElement into template', async () => {
      class Test1 extends CorpusculeElement {
        public static readonly is: string = `x-${uuid()}`;

        protected [render](): TemplateResult | null {
          return dhtml`<div>Test content</div>`;
        }
      }

      customElements.define(Test1.is, Test1);

      // tslint:disable-next-line:naming-convention
      const Test1Tag = unsafeStatic(Test1.is);

      class Test2 extends CorpusculeElement {
        public static readonly is: string = `x-${uuid()}`;

        protected [render](): TemplateResult | null {
          return dhtml`<${Test1Tag}/>`;
        }
      }

      const el = defineAndMount(Test2);
      await el.elementRendering;

      const inner: Test1 | null = el.shadowRoot!.querySelector(Test1.is);
      await inner!.elementRendering;

      expect(inner).not.toBeNull();
      expect(inner!.shadowRoot!.textContent).toContain('Test content');
    });

    it('should render string marked with tag() directive into template', async () => {
      const section = unsafeStatic('section');

      class Test extends CorpusculeElement {
        public static readonly is: string = `x-${uuid()}`;

        protected [render](): TemplateResult | null {
          return dhtml`<${section}>Test content</${section}>`;
        }
      }

      const el = defineAndMount(Test);
      await el.elementRendering;

      const inner = el.shadowRoot!.querySelector('section');
      expect(inner).not.toBeNull();
      expect(inner!.textContent).toContain('Test content');
    });

    it('should work properly with complex nesting', async () => {
      class Test1 extends CorpusculeElement {
        public static readonly is: string = `x-${uuid()}`;

        protected [render](): TemplateResult | null {
          return dhtml`<div><slot/></div>`;
        }
      }

      customElements.define(Test1.is, Test1);

      // tslint:disable-next-line:naming-convention
      const Test1Tag = unsafeStatic(Test1.is);

      class Test2 extends CorpusculeElement {
        public static readonly is: string = `x-${uuid()}`;

        protected [render](): TemplateResult | null {
          const testContentText = 'Test content';
          const nestedTwiceText = 'Nested twice';

          return dhtml`
            <${Test1Tag}>
              <div>Nested simple</div>
              ${testContentText}
              <${Test1Tag}>
                Nested Test
                <section>${nestedTwiceText}</section>
              </${Test1Tag}>
            </${Test1Tag}>`;
        }
      }

      const el = defineAndMount(Test2);
      await el.elementRendering;

      const container = el.shadowRoot!.querySelector(Test1.is)!;
      expect(container).not.toBeNull();
      expect(container).toEqual(jasmine.any(Test1));
      expect(container.textContent).toContain('Test content');

      const nestedSimple = container.querySelector('div')!;
      expect(nestedSimple).not.toBeNull();
      expect(nestedSimple.textContent).toContain('Nested simple');

      const nestedContainer = container.querySelector(Test1.is)!;
      expect(nestedContainer).not.toBeNull();
      expect(nestedContainer.textContent).toContain('Nested Test');

      const nestedTwice = nestedContainer.querySelector('section')!;
      expect(nestedTwice).not.toBeNull();
      expect(nestedTwice.textContent).toContain('Nested twice');
    });
  });
};

export default testDhtml;
