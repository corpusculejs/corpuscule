// tslint:disable:await-promise max-classes-per-file
import {TemplateResult} from 'lit-html';
import {html} from 'lit-html/lib/lit-extended';
// tslint:disable-next-line:no-implicit-dependencies
import uuid from 'uuid/v4';
import CorpusculeElement from '../../src';
import {registerAndMount} from '../utils';

const didMethods = () => {
  describe('didMethods', () => {
    it('should call _didMount() callback on mounting', () => {
      const spy = jasmine.createSpy('OnMount');

      class Test extends CorpusculeElement {
        public static is: string = `x-${uuid()}`;

        protected _didMount(): void {
          spy();
        }

        protected _render(): TemplateResult {
          return html`<span>Test content</span>`;
        }
      }

      registerAndMount(Test.is, Test);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should call _didUnmount() callback on unmounting', () => {
      const spy = jasmine.createSpy('OnUnmount');

      class Test extends CorpusculeElement {
        public static is: string = `x-${uuid()}`;

        protected _didUnmount(): void {
          spy();
        }

        protected _render(): TemplateResult {
          return html`<span>Test content</span>`;
        }
      }

      const el = registerAndMount(Test.is, Test);
      document.body.removeChild(el);

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should call _didUpdate() on every update', async () => {
      const spy = jasmine.createSpy('OnUpdate');

      class Test extends CorpusculeElement {
        public static is: string = `x-${uuid()}`;

        public num: number = 1;

        protected _didUpdate(): void {
          spy();
        }

        protected _render(): TemplateResult {
          return html`<span id="node">Test content #${this.num}</span>`;
        }
      }

      const el = registerAndMount(Test.is, Test);
      el.num = 2;

      await el.forceUpdate();

      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
};

export default didMethods;
