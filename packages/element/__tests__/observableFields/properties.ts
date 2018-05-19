// tslint:disable:await-promise max-classes-per-file
import {TemplateResult} from 'lit-html';
import {html} from 'lit-html/lib/lit-extended';
// tslint:disable-next-line:no-implicit-dependencies
import uuid from 'uuid/v4';
import CorpusculeElement, {PropertyDescriptorMap} from '../../src';
import {createAndMount} from '../utils';

const properties = () => {
  describe('properties', () => {
    it('should update on property change', () => {
      class Test extends CorpusculeElement {
        public static is: string = `x-${uuid()}`;

        protected static get _properties(): PropertyDescriptorMap<any> {
          return {
            index: null,
          };
        }

        public index: number = 1;

        protected _render(): TemplateResult {
          return html`<span id="node">#${this.index}</span>`;
        }
      }

      const el = createAndMount(Test.is, Test);
      const node = el.shadowRoot!.getElementById('node')!;

      expect(node.textContent).toBe('#1');

      el.index = 2;

      expect(node.textContent).toBe('#2');
    });

    it('should throw error if guard is set and value has wrong type', () => {
      class Test extends CorpusculeElement {
        public static is: string = `x-${uuid()}`;

        protected static get _properties(): PropertyDescriptorMap<any> {
          return {
            str: value => typeof value === 'string',
          };
        }

        public str: string = '';

        protected _render(): TemplateResult {
          return html`<span id="node">Test content</span>`;
        }
      }

      const el = createAndMount(Test.is, Test);

      expect(() => {
        (el as any).str = 1;
      }).toThrow(new TypeError('Value applied to "str" has wrong type'));
    });

    it('should avoid re-render if property values are identical and pureness is not disabled', () => {
      const spy = jasmine.createSpy('OnRender');

      class Test extends CorpusculeElement {
        public static is: string = `x-${uuid()}`;

        protected static get _properties(): PropertyDescriptorMap<any> {
          return {
            str: value => typeof value === 'string',
          };
        }

        public str: string = '1';

        protected _render(): TemplateResult {
          spy();

          return html`<span id="node">Test content</span>`;
        }
      }

      const el = createAndMount(Test.is, Test);

      el.str = '1';

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should re-render if property pureness is disabled', () => {
      const spy = jasmine.createSpy('OnRender');

      class Test extends CorpusculeElement {
        public static is: string = `x-${uuid()}`;

        protected static get _properties(): PropertyDescriptorMap<any> {
          return {
            str: [value => typeof value === 'string', {pure: false}],
          };
        }

        public str: string = '1';

        protected _render(): TemplateResult {
          spy();

          return html`<span id="node">Test content</span>`;
        }
      }

      const el = createAndMount(Test.is, Test);

      el.str = '1';

      expect(spy).toHaveBeenCalledTimes(2);
    });
  });
};

export default properties;
