// tslint:disable:await-promise max-classes-per-file
import {TemplateResult} from "lit-html";
import {html} from "lit-html/lib/lit-extended";
// tslint:disable-next-line:no-implicit-dependencies
import uuid from "uuid/v4";
import {defineAndMount} from "../../../../test/utils";
import CorpusculeElement, {attribute, render} from "../../src";

const attributes = () => {
  describe("attributes", () => {
    it("should update on attribute change", async () => {
      class Test extends CorpusculeElement {
        public static is: string = `x-${uuid()}`;

        @attribute("idx", Number, {pure: true})
        public index?: number;

        protected [render](): TemplateResult {
          return html`<span id="node">${
            this.index !== undefined
              ? `#${this.index}`
              : "Nothing"
            }</span>`;
        }
      }

      const el = defineAndMount(Test);
      await el.renderingPromise;

      const node = el.shadowRoot!.getElementById("node")!;

      expect(node.textContent).toBe("Nothing");

      el.setAttribute("idx", "2");
      await el.renderingPromise;

      expect(node.textContent).toBe("#2");
    });

    it("should set default attribute value if no attribute is set before mounting", async () => {
      class Test extends CorpusculeElement {
        public static is: string = `x-${uuid()}`;

        @attribute("idx", Number)
        public index: number = 2;

        protected [render](): TemplateResult {
          return html`<span id="node">#${this.index}</span>`;
        }
      }

      const el = defineAndMount(Test);
      await el.renderingPromise;

      expect(el.getAttribute("idx")).toBe("2");

      const node = el.shadowRoot!.getElementById("node")!;
      expect(node.textContent).toBe("#2");
    });

    it("should set value from attribute value, if any values are set before mounting", async () => {
      class Test extends CorpusculeElement {
        public static is: string = `x-${uuid()}`;

        @attribute("idx", Number)
        public index: number = 1;

        protected [render](): TemplateResult {
          return html`<span id="node">#${this.index}</span>`;
        }
      }

      const el = defineAndMount(Test, (e) => {
        e.setAttribute("idx", "2");
      });

      await el.renderingPromise;

      expect(el.index).toBe(2);
    });

    it("should set attribute value on attribute property change", async () => {
      class Test extends CorpusculeElement {
        public static is: string = `x-${uuid()}`;

        @attribute("idx", Number)
        public index: number = 1;

        protected [render](): TemplateResult {
          return html`<span id="node">#${this.index}</span>`;
        }
      }

      const el = defineAndMount(Test);
      await el.renderingPromise;

      el.index = 2;
      await el.renderingPromise;

      expect(el.getAttribute("idx")).toBe("2");
    });

    it("should avoid re-render if attribute values are identical and pureness is not disabled", async () => {
      const spy = jasmine.createSpy("OnRender");

      class Test extends CorpusculeElement {
        public static is: string = `x-${uuid()}`;

        @attribute("idx", Number)
        public index: number = 1;

        protected [render](): TemplateResult {
          spy();

          return html`<span id="node">#${this.index}</span>`;
        }
      }

      const el = defineAndMount(Test);
      await el.renderingPromise;

      el.index = 1;
      await el.renderingPromise;

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("should re-render if property pureness is disabled", async () => {
      const spy = jasmine.createSpy("OnRender");

      class Test extends CorpusculeElement {
        public static is: string = `x-${uuid()}`;

        @attribute("idx", Number, {pure: false})
        public index: number = 1;

        protected [render](): TemplateResult {
          spy();

          return html`<span id="node">#${this.index}</span>`;
        }
      }

      const el = defineAndMount(Test);
      await el.renderingPromise;

      el.index = 1;
      await el.renderingPromise;

      expect(spy).toHaveBeenCalledTimes(2);
    });

    it("should add and remove attribute if it has boolean type", async () => {
      class Test extends CorpusculeElement {
        public static is: string = `x-${uuid()}`;

        @attribute("has", Boolean)
        public has: boolean = false;

        protected [render](): TemplateResult {
          return html`<span id="node">Test content</span>`;
        }
      }

      const el = defineAndMount(Test);
      await el.renderingPromise;

      expect(el.hasAttribute("has")).not.toBeTruthy();

      el.has = true;
      await el.renderingPromise;

      expect(el.hasAttribute("has")).toBeTruthy();

      el.has = false;
      await el.renderingPromise;

      expect(el.hasAttribute("has")).not.toBeTruthy();
    });

    it("should throw error, if attribute value does not fit guard", async () => {
      class Test extends CorpusculeElement {
        public static is: string = `x-${uuid()}`;

        @attribute("idx", Number)
        public index: number = 1;

        protected [render](): TemplateResult {
          return html`<span id="node">#${this.index}</span>`;
        }
      }

      const el = defineAndMount(Test);
      await el.renderingPromise;

      expect(() => {
        (el as any).index = "string";
      }).toThrow(new TypeError("Value applied to \"index\" is not Number"));
    });
  });
};

export default attributes;
