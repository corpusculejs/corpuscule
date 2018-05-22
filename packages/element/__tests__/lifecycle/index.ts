// tslint:disable:await-promise max-classes-per-file
import {TemplateResult} from 'lit-html';
import {html} from 'lit-html/lib/lit-extended';
// tslint:disable-next-line:no-implicit-dependencies
import uuid from 'uuid/v4';
import CorpusculeElement, {render} from '../../src';
import {registerAndMount} from '../utils';
import didMethods from './didMethods';
import methods from './methods';

const lifecycle = () => {
  describe('lifecycle', () => {
    it('should allow to create basic custom element', () => {
      class Test extends CorpusculeElement {
        public static is: string = `x-${uuid()}`;

        protected [render](): TemplateResult {
          return html`<span id="node">Test content</span>`;
        }
      }

      registerAndMount(Test.is, Test);

      const collection = document.body.getElementsByTagName(Test.is);
      expect(collection.length).toBe(1);

      const el = collection.item(0);
      expect(el).toEqual(jasmine.any(Test));

      const root = el.shadowRoot;
      expect(root).not.toBeNull();

      const node = root!.getElementById('node');
      expect(node).not.toBeNull();
      expect(node!.textContent).toBe('Test content');
    });

    it('should update by calling forceUpdate()', async () => {
      class Test extends CorpusculeElement {
        public static is: string = `x-${uuid()}`;

        public num: number = 1;

        protected [render](): TemplateResult {
          return html`<span id="node">Test content #${this.num}</span>`;
        }
      }

      const el = registerAndMount(Test.is, Test);

      const node = el.shadowRoot!.getElementById('node')!;
      expect(node.textContent).toBe('Test content #1');

      el.num = 2;
      expect(node.textContent)
        .toBe('Test content #1');

      await el.forceUpdate();

      expect(node.textContent).toBe('Test content #2');
    });

    it('should allow to return null in [render]()', () => {
      class Test extends CorpusculeElement {
        public static is: string = `x-${uuid()}`;

        public num: number = 1;

        protected [render](): null {
          return null;
        }
      }

      const el = registerAndMount(Test.is, Test);

      expect(el.shadowRoot!.innerHTML).toBe('');
    });

    didMethods();
    methods();
  });
};

export default lifecycle;
