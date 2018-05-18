// tslint:disable:await-promise max-classes-per-file
import {TemplateResult} from 'lit-html';
import {html} from 'lit-html/lib/lit-extended';
// tslint:disable-next-line:no-implicit-dependencies
import uuid from 'uuid/v4';
import CorpusculeElement, {PropertyDescriptorMap, StateDescriptorMap} from '../../src';
import {createAndMount} from '../utils';

const methods = () => {
  describe('static methods', () => {
    it('should disable updating if _shouldUpdate() returns false', () => {
      const spy = jasmine.createSpy('OnRender');

      class Test extends CorpusculeElement {
        public static is: string = `x-${uuid()}`;

        protected static get _properties(): PropertyDescriptorMap<any> {
          return {
            num: null,
          };
        }

        protected static _shouldUpdate(): boolean {
          return false;
        }

        public num: number = 1;

        protected _render(): TemplateResult {
          spy();

          return html`<span id="node">Test content #${this.num}</span>`;
        }
      }

      const el = createAndMount(Test.is, Test);

      el.num = 2;

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should not consider result of _shouldUpdate() if update is forced', async () => {
      const spy = jasmine.createSpy('OnRender');

      class Test extends CorpusculeElement {
        public static is: string = `x-${uuid()}`;

        protected static get _properties(): PropertyDescriptorMap<any> {
          return {
            num: null,
          };
        }

        protected static _shouldUpdate(): boolean {
          return false;
        }

        public num: number = 1;

        protected _render(): TemplateResult {
          spy();

          return html`<span id="node">Test content #${this.num}</span>`;
        }
      }

      const el = createAndMount(Test.is, Test);

      await el.forceUpdate();

      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('should recalculate state on props change if _deriveStateFromProps() is defined', () => {
      class Test extends CorpusculeElement {
        public static is: string = `x-${uuid()}`;

        protected static get _properties(): PropertyDescriptorMap<any> {
          return {
            prop: null,
          };
        }

        protected static get _states(): StateDescriptorMap<any> {
          return ['state'];
        }

        protected static _deriveStateFromProps({prop: nextProp}: any, {prop: prevProp}: any): any {
          return {
            state: nextProp < prevProp,
          };
        }

        public prop: number = 1;

        public state: boolean = false;

        protected _render(): TemplateResult {
          return html`<span id="node">Test content</span>`;
        }
      }

      const el = createAndMount(Test.is, Test);

      el.prop = 3;

      expect(el.state).not.toBeTruthy();

      el.prop = 2;

      expect(el.state).toBeTruthy();
    });

    it('should get the promise to wait until component\'s rendering is done', () => {
      class Test extends CorpusculeElement {
        public static is: string = `x-${uuid()}`;

        protected _render(): TemplateResult {
          return html`<span id="node">Test content</span>`;
        }
      }

      const el = createAndMount(Test.is, Test);

      el.forceUpdate(); // tslint:disable-line:no-floating-promises

      expect(el.rendering).toEqual(jasmine.any(Promise));
    });

    it('should get the promise even if there is no rendering yet', () => {
      class Test extends CorpusculeElement {
        public static is: string = `x-${uuid()}`;

        protected _render(): TemplateResult {
          return html`<span id="node">Test content</span>`;
        }
      }

      createAndMount(Test.is, Test, (e) => {
        expect(e.rendering).toEqual(jasmine.any(Promise));
      });
    });
  });
};

export default methods;
