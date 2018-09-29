// tslint:disable:await-promise max-classes-per-file
import {html, TemplateResult} from "lit-html";
// tslint:disable-next-line:no-implicit-dependencies
import uuid from "uuid/v4";
import {defineAndMount} from "../../../../test/utils";
import CorpusculeElement, {computed, render} from "../../src";

const testComputed = () => {
  describe("computed", () => {
    it("should memoize result of processed getter", async () => {
      const spy = jasmine.createSpy("OnComputed");

      class Test extends CorpusculeElement {
        public static is: string = `x-${uuid()}`;

        public first: number = 1;
        public second: number = 2;

        @computed("first", "second")
        public get comp(): number {
          spy();

          return this.first + this.second;
        }

        protected [render](): TemplateResult {
          return html`<span id="node">Test content</span>`;
        }
      }

      const el = defineAndMount(Test);
      await el.elementRendering;

      expect(el.comp).toBe(3);
      expect(el.comp).toBe(3);

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("should reset result on watching property change", async () => {
      const spy = jasmine.createSpy("OnComputed");

      class Test extends CorpusculeElement {
        public static is: string = `x-${uuid()}`;

        public first: number = 1;
        public second: number = 2;

        @computed("first", "second")
        public get comp(): number {
          spy();

          return this.first + this.second;
        }

        protected [render](): TemplateResult {
          return html`<span id="node">Test content</span>`;
        }
      }

      const el = defineAndMount(Test);
      await el.elementRendering;

      expect(el.comp).toBe(3);

      el.first = 0;
      el.second = 1;
      await el.elementRendering;

      expect(el.comp).toBe(1);
      expect(el.comp).toBe(1);

      expect(spy).toHaveBeenCalledTimes(2);
    });

    it("should allow to define property in any place of prototype chain", async () => {
      class Parent extends CorpusculeElement {
        public static is: string = `x-${uuid()}`;

        public first: number = 1;

        @computed("first")
        public get comp(): number {
          return this.first + 2;
        }

        protected [render](): TemplateResult {
          return html`<span id="node">Test content</span>`;
        }
      }

      class Child extends Parent {
      }

      const el = defineAndMount(Child);
      await el.elementRendering;

      expect(el.comp).toBe(3);
    });
  });
};

export default testComputed;
