// tslint:disable:await-promise max-classes-per-file
import {TemplateResult} from "lit-html";
import {html} from "lit-html/lib/lit-extended";
// tslint:disable-next-line:no-implicit-dependencies
import uuid from "uuid/v4";
import {defineAndMount} from "../../../../test/utils";
import CorpusculeElement, {
  AttributeDescriptorMap,
  attributeMap,
  didUpdate,
  PropertyDescriptorMap,
  propertyMap,
  render,
  StateDescriptorMap,
  stateMap,
} from "../../src";
import attributes from "./attributes";
import computed from "./computed";
import properties from "./properties";
import states from "./states";

const observableFields = () => {
  describe("observable fields", () => {
    attributes();
    properties();
    states();
    computed();

    it("should call [didUpdate]() with proper prevProperties and prevState", async () => {
      const spy = jasmine.createSpy("OnUpdate");

      class Test extends CorpusculeElement {
        public static is: string = `x-${uuid()}`;

        public static get [attributeMap](): AttributeDescriptorMap<Test> {
          return {
            attr: ["attr", String],
          };
        }

        public static get [propertyMap](): PropertyDescriptorMap<Test> {
          return {
            prop: null,
          };
        }

        public static get [stateMap](): StateDescriptorMap<Test> {
          return ["state"];
        }

        public attr: string = "zeroAttr";
        public prop: string = "zeroProp";

        // tslint:disable-next-line:no-unused-variable
        private state: string = "zeroState";

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
      await el.renderingPromise;

      el.setAttribute("attr", "oneAttr");
      await el.renderingPromise;

      expect(spy)
        .toHaveBeenCalledWith({
          attr: "zeroAttr",
          prop: "zeroProp",
        }, {
          state: "zeroState",
        });

      el.prop = "oneProp";
      await el.renderingPromise;

      expect(spy).toHaveBeenCalledWith({
        attr: "oneAttr",
        prop: "zeroProp",
      }, {
        state: "zeroState",
      });

      el.updateState("oneState");
      await el.renderingPromise;

      expect(spy).toHaveBeenCalledWith({
        attr: "oneAttr",
        prop: "oneProp",
      }, {
        state: "zeroState",
      });

      el.setAttribute("attr", "twoAttr");
      await el.renderingPromise;

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
