// tslint:disable:await-promise max-classes-per-file
import {html, TemplateResult} from 'lit-html';
// tslint:disable-next-line:no-implicit-dependencies
import uuid from 'uuid/v4';
import {defineAndMount} from '../../../../test/utils';
import CorpusculeElement, {render, state} from '../../src';

const testRender = () => {
  describe('[render]', () => {
    let elementName: string;

    beforeEach(() => {
      elementName = `x-${uuid()}`;
    });

    it('should be able to return null to avoid any change in DOM', async () => {
      class Test extends CorpusculeElement {
        public static readonly is: string = elementName;

        @state private switched: boolean = true;

        public switch(): void {
          this.switched = !this.switched;
        }

        protected [render](): TemplateResult | null {
          return this.switched
            ? html`<div>${this.switched}</div>`
            : null;
        }
      }

      const el = defineAndMount(Test);
      await el.elementRendering;
      expect(el.shadowRoot!.textContent).toContain('true');

      el.switch();
      await el.elementRendering;
      expect(el.shadowRoot!.textContent).toContain('true');
    });

    it('should throw error if render is not implemented', async () => {
      class Test extends CorpusculeElement {
        public static readonly is: string = elementName;
      }

      const el = defineAndMount(Test);

      return el.elementRendering.catch(({message}) => {
        expect(message).toBe('[render]() is not implemented');
      });
    });
  });
};

export default testRender;
