// tslint:disable:await-promise max-classes-per-file
import {html, TemplateResult} from "lit-html";
// tslint:disable-next-line:no-implicit-dependencies
import uuid from "uuid/v4";
import {defineAndMount} from "../../../../test/utils";
import CorpusculeElement, {render} from "../../src";
import testDeriveStateFromProps from "./deriveStateFromProps";
import testForceUpdate from "./forceUpdate";
import testMounting from "./mounting";
import testRender from "./render";
import testUnmounting from "./unmounting";
import testUpdating from "./updating";

const testCorpusculeElement = () => {
  describe("CorpusculeElement", () => {
    it("should allow to create basic custom element", async () => {
      class Test extends CorpusculeElement {
        public static is: string = `x-${uuid()}`;

        protected [render](): TemplateResult {
          return html`<span id="node">Test content</span>`;
        }
      }

      const test = defineAndMount(Test);
      await test.elementRendering;

      const collection = document.body.getElementsByTagName(Test.is);
      expect(collection.length).toBe(1);

      const el = collection.item(0);
      expect(el).toEqual(jasmine.any(Test));

      const root = el.shadowRoot;
      expect(root).not.toBeNull();

      const node = root!.getElementById("node");
      expect(node).not.toBeNull();
      expect(node!.textContent).toBe("Test content");
    });

    testMounting();
    testUpdating();
    testUnmounting();
    testDeriveStateFromProps();
    testRender();
    testForceUpdate();
  });
};

export default testCorpusculeElement;
