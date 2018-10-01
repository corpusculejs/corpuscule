// tslint:disable:await-promise max-classes-per-file
import {html, TemplateResult} from "lit-html";
// tslint:disable-next-line:no-implicit-dependencies
import uuid from "uuid/v4";
import {defineAndMount} from "../../../../test/utils";
import CorpusculeElement, {render, state} from "../../src";

const testStateDecorator = () => {
  describe("@state", () => {
    let elementName: string;

    beforeEach(() => {
      elementName = `x-${uuid()}`;
    });

    it("should update on state change", async () => {
      class Test extends CorpusculeElement {
        public static is: string = elementName;

        @state
        private index: number = 1;

        public updateIndexTo(i: number): void {
          this.index = i;
        }

        protected [render](): TemplateResult {
          return html`<span id="node">#${this.index}</span>`;
        }
      }

      const el = defineAndMount(Test);
      await el.elementRendering;

      const node = el.shadowRoot!.getElementById("node")!;

      expect(node.textContent).toBe("#1");

      el.updateIndexTo(2);
      await el.elementRendering;

      expect(node.textContent).toBe("#2");
    });
  });
};

export default testStateDecorator;