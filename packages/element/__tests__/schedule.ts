import {html, TemplateResult} from "lit-html";
import {unsafeHTML} from "lit-html/directives/unsafe-html";
// tslint:disable-next-line:no-implicit-dependencies
import uuid from "uuid/v4";
import {defineAndMount} from "../../../test/utils";
import CorpusculeElement, {didMount, render} from "../src";

const testSchedule = () => {
  describe("schedule", () => {
    let elementName: string;
    let raf: jasmine.Spy;

    beforeEach(() => {
      elementName = `x-${uuid()}`;
      raf = spyOn(window, "requestAnimationFrame").and.callThrough();
    });

    it("should call requestAnimationFrame during rendering only once", async () => {
      let nesting = 0;

      class Test extends CorpusculeElement {
        public static is: string = elementName;

        protected [didMount](): void {
          nesting += 1;
        }

        protected [render](): TemplateResult {
          return nesting === 3
            ? html`<div>${nesting}</div>`
            : html`${unsafeHTML(`<${elementName}/>`)}`;
        }
      }

      const el = defineAndMount(Test);

      await el.elementRendering;

      expect(raf).toHaveBeenCalledTimes(1);

      const firstNestning = el.shadowRoot!.querySelector(elementName);
      expect(firstNestning).not.toBeNull();

      const secondNesting = firstNestning!.shadowRoot!.querySelector(elementName);
      expect(secondNesting).not.toBeNull();

      const thirdNesting = secondNesting!.shadowRoot!.querySelector(elementName);
      expect(thirdNesting).not.toBeNull();

      const div = thirdNesting!.shadowRoot!.querySelector("div");
      expect(div).not.toBeNull();
      expect(div!.textContent).toContain("3");
    });
  });
};

export default testSchedule;
