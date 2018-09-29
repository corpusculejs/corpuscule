// tslint:disable:await-promise max-classes-per-file
import {html, TemplateResult} from "lit-html";
// tslint:disable-next-line:no-implicit-dependencies
import uuid from "uuid/v4";
import {defineAndMount} from "../../../../test/utils";
import CorpusculeElement, {
  attribute,
  didUpdate, property,
  render,
  state,
} from "../../src";
import attributes from "./attributes";
import testComputed from "./computed";
import properties from "./properties";
import states from "./states";

const observableFields = () => {
  describe("observable fields", () => {
    attributes();
    properties();
    states();
    testComputed();

    it("should call [didUpdate]() with proper prevProperties and prevState", async () => {
      const spy = jasmine.createSpy("OnUpdate");

      class Test extends CorpusculeElement {
        public static is: string = `x-${uuid()}`;

        @attribute("attr", String)
        public attr: string = "zeroAttr";

        @property()
        public prop: string = "zeroProp";

        @state
        private state: string = "zeroState"; // tslint:disable-line:no-unused-variable

        public updateState(str: string): void {
          this.state = str;
        }

        protected [didUpdate](...args: any[]): void {
          spy(...args);
        }

        protected [render](): TemplateResult {
          return html`<span id="node">Test content</span>`;
        }
      }

      const el = defineAndMount(Test);
      await el.elementRendering;

      el.setAttribute("attr", "oneAttr");
      await el.elementRendering;

      expect(spy)
        .toHaveBeenCalledWith({
          attr: "zeroAttr",
          prop: "zeroProp",
        }, {
          state: "zeroState",
        });

      el.prop = "oneProp";
      await el.elementRendering;

      expect(spy).toHaveBeenCalledWith({
        attr: "oneAttr",
        prop: "zeroProp",
      }, {
        state: "zeroState",
      });

      el.updateState("oneState");
      await el.elementRendering;

      expect(spy).toHaveBeenCalledWith({
        attr: "oneAttr",
        prop: "oneProp",
      }, {
        state: "zeroState",
      });

      el.setAttribute("attr", "twoAttr");
      await el.elementRendering;

      expect(spy).toHaveBeenCalledWith({
        attr: "oneAttr",
        prop: "oneProp",
      }, {
        state: "oneState",
      });
    });
  });
};

export default observableFields;
