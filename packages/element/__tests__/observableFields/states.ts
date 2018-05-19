// tslint:disable:await-promise max-classes-per-file
import {TemplateResult} from 'lit-html';
import {html} from 'lit-html/lib/lit-extended';
// tslint:disable-next-line:no-implicit-dependencies
import uuid from 'uuid/v4';
import CorpusculeElement, {StateDescriptorMap} from '../../src';
import {registerAndMount} from '../utils';

const states = () => {
  describe('states', () => {
    it('should update on state change', () => {
      class Test extends CorpusculeElement {
        public static is: string = `x-${uuid()}`;

        protected static get _states(): StateDescriptorMap<any> {
          return ['__index'];
        }

        private __index: number = 1;

        public updateIndexTo(i: number): void {
          this.__index = i;
        }

        protected _render(): TemplateResult {
          return html`<span id="node">#${this.__index}</span>`;
        }
      }

      const el = registerAndMount(Test.is, Test);
      const node = el.shadowRoot!.getElementById('node')!;

      expect(node.textContent).toBe('#1');

      el.updateIndexTo(2);

      expect(node.textContent).toBe('#2');
    });
  });
};

export default states;
