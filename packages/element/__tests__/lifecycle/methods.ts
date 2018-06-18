// tslint:disable:await-promise max-classes-per-file
import {TemplateResult} from "lit-html";
import {html} from "lit-html/lib/lit-extended";
// tslint:disable-next-line:no-implicit-dependencies
import uuid from "uuid/v4";
import {defineAndMount} from "../../../../test/utils";
import CorpusculeElement, {
  deriveStateFromProps,
  PropertyDescriptorMap,
  propertyMap,
  render,
  shouldUpdate,
  StateDescriptorMap, stateMap
} from "../../src";

const methods = () => {
  describe("static methods", () => {
    it("should disable updating if [shouldUpdate]() returns false", async () => {
      const spy = jasmine.createSpy("OnRender");

      class Test extends CorpusculeElement {
        public static is: string = `x-${uuid()}`;

        public static get [propertyMap](): PropertyDescriptorMap<any> {
          return {
            num: null,
          };
        }

        public static [shouldUpdate](): boolean {
          return false;
        }

        public num: number = 1;

        protected [render](): TemplateResult {
          spy();

          return html`<span id="node">Test content #${this.num}</span>`;
        }
      }

      const el = defineAndMount(Test);

      await el.renderingPromise;

      el.num = 2;

      await el.renderingPromise;

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("should not consider result of [shouldUpdate]() if update is forced", async () => {
      const spy = jasmine.createSpy("OnRender");

      class Test extends CorpusculeElement {
        public static is: string = `x-${uuid()}`;

        public static get [propertyMap](): PropertyDescriptorMap<any> {
          return {
            num: null,
          };
        }

        public static [shouldUpdate](): boolean {
          return false;
        }

        public num: number = 1;

        protected [render](): TemplateResult {
          spy();

          return html`<span id="node">Test content #${this.num}</span>`;
        }
      }

      const el = defineAndMount(Test);

      await el.renderingPromise;

      await el.forceUpdate();

      expect(spy).toHaveBeenCalledTimes(2);
    });

    it("should recalculate state on props change if [deriveStateFromProps]() is defined", async () => {
      class Test extends CorpusculeElement {
        public static is: string = `x-${uuid()}`;

        public static get [propertyMap](): PropertyDescriptorMap<any> {
          return {
            prop: null,
          };
        }

        public static get [stateMap](): StateDescriptorMap<any> {
          return ["state"];
        }

        public static [deriveStateFromProps]({prop: nextProp}: any, {prop: prevProp}: any): any {
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

      const el = defineAndMount(Test);
      await el.renderingPromise;

      el.prop = 3;
      await el.renderingPromise;

      expect(el.state).not.toBeTruthy();

      el.prop = 2;
      await el.renderingPromise;

      expect(el.state).toBeTruthy();
    });

    it("should get the promise to wait until component's renderingProcess is done", () => {
      class Test extends CorpusculeElement {
        public static is: string = `x-${uuid()}`;

        protected [render](): TemplateResult {
          return html`<span id="node">Test content</span>`;
        }
      }

      const el = defineAndMount(Test);

      el.forceUpdate(); // tslint:disable-line:no-floating-promises

      expect(el.renderingPromise).toEqual(jasmine.any(Promise));
    });

    it("should get the promise even if there is no renderingProcess yet", () => {
      class Test extends CorpusculeElement {
        public static is: string = `x-${uuid()}`;

        protected [render](): TemplateResult {
          return html`<span id="node">Test content</span>`;
        }
      }

      defineAndMount(Test, (e) => {
        expect(e.renderingPromise).toEqual(jasmine.any(Promise));
      });
    });
  });
};

export default methods;
