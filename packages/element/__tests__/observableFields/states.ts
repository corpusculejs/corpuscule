// tslint:disable:await-promise max-classes-per-file
import {TemplateResult} from "lit-html";
import {html} from "lit-html/lib/lit-extended";
// tslint:disable-next-line:no-implicit-dependencies
import uuid from "uuid/v4";
import {defineAndMount} from "../../../../test/utils";
import CorpusculeElement, {render, state} from "../../src";

const states = () => {
  describe("states", () => {
    it("should update on state change", async () => {
      class Test extends CorpusculeElement {
        public static is: string = `x-${uuid()}`;

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
      await el.renderingPromise;

      const node = el.shadowRoot!.getElementById("node")!;

      expect(node.textContent).toBe("#1");

      el.updateIndexTo(2);
      await el.renderingPromise;

      expect(node.textContent).toBe("#2");
    });
  });
};

export default states;
