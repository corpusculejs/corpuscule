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
import testAttributeDecorator from "./attributeDecorator";
import testCreateComputingPair from "./computedDecorator";
import testElementDecorator from "./elementDecorator";
import testPropertyDecorator from "./propertyDecorator";
import testStateDecorator from "./stateDecorator";

const testDecorators = () => {
  describe("decorators", () => {
    let elementName: string;

    beforeEach(() => {
      elementName = `x-${uuid()}`;
    });

    testAttributeDecorator();
    testCreateComputingPair();
    testElementDecorator();
    testPropertyDecorator();
    testStateDecorator();

    it("should call [didUpdate]() with proper prevProperties and prevState", async () => {
      const spy = jasmine.createSpy("OnUpdate");

      class Test extends CorpusculeElement {
        public static is: string = elementName;

        @attribute("attr", String)
        public attr: string = "zeroAttr";

        @property()
        public prop: string = "zeroProp";

        // @ts-ignore
        @state private state: string = "zeroState"; // tslint:disable-line:no-unused-variable

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

export default testDecorators;
