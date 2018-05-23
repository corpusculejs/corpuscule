// tslint:disable:await-promise max-classes-per-file
import {TemplateResult} from 'lit-html';
import {html} from 'lit-html/lib/lit-extended';
// tslint:disable-next-line:no-implicit-dependencies
import uuid from 'uuid/v4';
import CorpusculeElement, {
  deriveStateFromProps,
  PropertyDescriptorMap,
  propertyMap,
  render,
  shouldUpdate,
  StateDescriptorMap, stateMap
} from '../../src';
import {registerAndMount} from '../utils';

const methods = () => {
  describe('static methods', () => {
    it('should disable updating if [shouldUpdate]() returns false', () => {
      const spy = jasmine.createSpy('OnRender');

      class Test extends CorpusculeElement {
        public static is: string = `x-${uuid()}`;

        protected static get [propertyMap](): PropertyDescriptorMap<any> {
          return {
            num: null,
          };
        }

        protected static [shouldUpdate](): boolean {
          return false;
        }

        public num: number = 1;

        protected [render](): TemplateResult {
          spy();

          return html`<span id="node">Test content #${this.num}</span>`;
        }
      }

      const el = registerAndMount(Test.is, Test);

      el.num = 2;

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should not consider result of [shouldUpdate]() if update is forced', async () => {
      const spy = jasmine.createSpy('OnRender');

      class Test extends CorpusculeElement {
        public static is: string = `x-${uuid()}`;

        protected static get [propertyMap](): PropertyDescriptorMap<any> {
          return {
            num: null,
          };
        }

        protected static [shouldUpdate](): boolean {
          return false;
        }

        public num: number = 1;

        protected [render](): TemplateResult {
          spy();

          return html`<span id="node">Test content #${this.num}</span>`;
        }
      }

      const el = registerAndMount(Test.is, Test);

      await el.forceUpdate();

      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('should recalculate state on props change if [deriveStateFromProps]() is defined', () => {
      class Test extends CorpusculeElement {
        public static is: string = `x-${uuid()}`;

        protected static get [propertyMap](): PropertyDescriptorMap<any> {
          return {
            prop: null,
          };
        }

        protected static get [stateMap](): StateDescriptorMap<any> {
          return ['state'];
        }

        protected static [deriveStateFromProps]({prop: nextProp}: any, {prop: prevProp}: any): any {
          return {
            state: nextProp < prevProp,
          };
        }

        public prop: number = 1;

        public state: boolean = false;

        protected [render](): TemplateResult {
          return html`<span id="node">Test content</span>`;
        }
      }

      const el = registerAndMount(Test.is, Test);

      el.prop = 3;

      expect(el.state).not.toBeTruthy();

      el.prop = 2;

      expect(el.state).toBeTruthy();
    });

    it('should get the promise to wait until component\'s renderingProcess is done', () => {
      class Test extends CorpusculeElement {
        public static is: string = `x-${uuid()}`;

        protected [render](): TemplateResult {
          return html`<span id="node">Test content</span>`;
        }
      }

      const el = registerAndMount(Test.is, Test);

      el.forceUpdate(); // tslint:disable-line:no-floating-promises

      expect(el.renderingProcess).toEqual(jasmine.any(Promise));
    });

    it('should get the promise even if there is no renderingProcess yet', () => {
      class Test extends CorpusculeElement {
        public static is: string = `x-${uuid()}`;

        protected [render](): TemplateResult {
          return html`<span id="node">Test content</span>`;
        }
      }

      registerAndMount(Test.is, Test, (e) => {
        expect(e.renderingProcess).toEqual(jasmine.any(Promise));
      });
    });
  });
};

export default methods;
