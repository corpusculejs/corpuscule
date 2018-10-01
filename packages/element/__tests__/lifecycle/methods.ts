// tslint:disable:await-promise max-classes-per-file
import {html, TemplateResult} from "lit-html";
// tslint:disable-next-line:no-implicit-dependencies
import uuid from "uuid/v4";
import {defineAndMount} from "../../../../test/utils";
import CorpusculeElement, {
  deriveStateFromProps,
  property,
  render,
  shouldUpdate, state,
} from "../../src";

const methods = () => {
  describe("static methods", () => {
    it("should disable updating if [shouldUpdate]() returns false", async () => {
      const spy = jasmine.createSpy("OnRender");

      class Test extends CorpusculeElement {
        public static is: string = `x-${uuid()}`;

        public static [shouldUpdate](): boolean {
          return false;
        }

        @property()
        public num: number = 1;

        protected [render](): TemplateResult {
          spy();

          return html`<span id="node">Test content #${this.num}</span>`;
        }
      }

      const el = defineAndMount(Test);

      await el.elementRendering;

      el.num = 2;

      await el.elementRendering;

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("should not consider result of [shouldUpdate]() if update is forced", async () => {
      const spy = jasmine.createSpy("OnRender");

      class Test extends CorpusculeElement {
        public static is: string = `x-${uuid()}`;

        public static [shouldUpdate](): boolean {
          return false;
        }

        @property()
        public num: number = 1;

        protected [render](): TemplateResult {
          spy();

          return html`<span id="node">Test content #${this.num}</span>`;
        }
      }

      const el = defineAndMount(Test);

      await el.elementRendering;

      await el.forceUpdate();

      expect(spy).toHaveBeenCalledTimes(2);
    });

    it("should recalculate state on props change if [deriveStateFromProps]() is defined", async () => {
      class Test extends CorpusculeElement {
        public static is: string = `x-${uuid()}`;

        public static [deriveStateFromProps]({prop: nextProp}: Test): any {
          return {
            state: nextProp + 10,
          };
        }

        @property()
        public prop: number = 1;

        @state
        public state: number = 0;

        protected [render](): TemplateResult {
          return html`<span id="node">Test content</span>`;
        }
      }

      const el = defineAndMount(Test);
      await el.elementRendering;
      expect(el.state).toBe(11);

      el.prop = 3;
      await el.elementRendering;

      expect(el.state).toBe(13);
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

      expect(el.elementRendering).toEqual(jasmine.any(Promise));
    });

    it("should get the promise even if there is no renderingProcess yet", () => {
      class Test extends CorpusculeElement {
        public static is: string = `x-${uuid()}`;

        protected [render](): TemplateResult {
          return html`<span id="node">Test content</span>`;
        }
      }

      defineAndMount(Test, (e) => {
        expect(e.elementRendering).toEqual(jasmine.any(Promise));
      });
    });
  });
};

export default methods;
