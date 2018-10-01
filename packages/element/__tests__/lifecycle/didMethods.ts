// tslint:disable:await-promise max-classes-per-file
import {html, TemplateResult} from "lit-html";
// tslint:disable-next-line:no-implicit-dependencies
import uuid from "uuid/v4";
import {defineAndMount} from "../../../../test/utils";
import CorpusculeElement, {didMount, didUnmount, didUpdate, render} from "../../src";

const didMethods = () => {
  describe("\"Did\"-methods", () => {
    it("should call [didMount]() callback on mounting", async () => {
      const spy = jasmine.createSpy("OnMount");

      class Test extends CorpusculeElement {
        public static is: string = `x-${uuid()}`;

        protected [didMount](): void {
          spy();
        }

        protected [render](): TemplateResult {
          return html`<span>Test content</span>`;
        }
      }

      const el = defineAndMount(Test);

      await el.elementRendering;

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("should call [didUnmount]() callback on unmounting", async () => {
      const spy = jasmine.createSpy("OnUnmount");

      class Test extends CorpusculeElement {
        public static is: string = `x-${uuid()}`;

        protected [didUnmount](): void {
          spy();
        }

        protected [render](): TemplateResult {
          return html`<span>Test content</span>`;
        }
      }

      const el = defineAndMount(Test);
      document.body.removeChild(el);

      await el.elementRendering;

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("should call [didUpdate]() on every update", async () => {
      const spy = jasmine.createSpy("OnUpdate");

      class Test extends CorpusculeElement {
        public static is: string = `x-${uuid()}`;

        public num: number = 1;

        protected [didUpdate](): void {
          spy();
        }

        protected [render](): TemplateResult {
          return html`<span id="node">Test content #${this.num}</span>`;
        }
      }

      const el = defineAndMount(Test);
      await el.elementRendering;

      el.num = 2;

      await el.forceUpdate();

      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
};

export default didMethods;
