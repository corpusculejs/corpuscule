// tslint:disable:max-classes-per-file
import {html, TemplateResult} from 'lit-html';
import {unsafeHTML} from 'lit-html/directives/unsafe-html';
// tslint:disable-next-line:no-implicit-dependencies
import uuid from 'uuid/v4';
import {defineAndMount} from '../../../test/utils';
import CorpusculeElement, {didMount, property, render} from '../src';

const testScheduler = () => {
  describe('scheduler', () => {
    let elementName: string;
    let nesting: number;

    beforeEach(() => {
      nesting = 0;
      elementName = `x-${uuid()}`;
    });

    it('should use requestAnimationFrame to initialize rendering', async () => {
      const raf = spyOn(window, 'requestAnimationFrame').and.callThrough();

      class Test extends CorpusculeElement {
        public static is: string = elementName;

        protected [didMount](): void {
          nesting += 1;
        }

        protected [render](): TemplateResult {
          return nesting === 2
            ? html`<div>${nesting}</div>`
            : html`${unsafeHTML(`<${elementName}/>`)}`;
        }
      }

      const el = defineAndMount(Test);

      await el.elementRendering;

      expect(raf).toHaveBeenCalledTimes(1);

      const firstNestning = el.shadowRoot!.querySelector(elementName);
      expect(firstNestning).not.toBeNull();

      const secondNesting = firstNestning!.shadowRoot!.querySelector(elementName);
      expect(secondNesting).not.toBeNull();

      const div = secondNesting!.shadowRoot!.querySelector('div');
      expect(div).not.toBeNull();
      expect(div!.textContent).toContain('2');
    });

    it('should consistently wait until all properties in all nested components are set', async () => {
      const renderSpy = jasmine.createSpy('render');

      class Test extends CorpusculeElement {
        public static is: string = 'x-test-wait';

        @property() public num: number = 0;
        @property() public str: string = '';
        @property() public bool: boolean = false;

        protected [didMount](): void {
          nesting += 1;
        }

        protected [render](): TemplateResult {
          renderSpy();
          expect(this.num).toBe(10);
          expect(this.str).toBe('test string');
          expect(this.bool).toBeTruthy();

          return nesting === 2
            ? html`<div>${nesting}</div>`
            : html`<x-test-wait .num="${10}" .str="${'test string'}" .bool=${true}/>`;
        }
      }

      const el = defineAndMount(Test, (element) => {
        element.num = 10;
        element.str = 'test string';
        element.bool = true;
      });

      await el.elementRendering;

      expect(renderSpy).toHaveBeenCalledTimes(3);
    });

    it('should consistently reject rendering promises until the top one', async () => {
      class Test1 extends CorpusculeElement {
        public static is: string = 'x-test-reject-1';

        protected [render](): TemplateResult | null {
          return html`<x-test-reject-2/>`;
        }
      }

      class Test2 extends CorpusculeElement {
        public static is: string = 'x-test-reject-2';

        protected [render](): TemplateResult | null {
          return html`<x-test-reject-3/>`;
        }
      }

      customElements.define(Test2.is, Test2);

      class Test3 extends CorpusculeElement {
        public static is: string = 'x-test-reject-3';
      }

      customElements.define(Test3.is, Test3);

      const el = defineAndMount(Test1);

      return el.elementRendering.catch(({message}) => {
        expect(message).toBe('[render]() is not implemented');
      });
    });
  });
};

export default testScheduler;
