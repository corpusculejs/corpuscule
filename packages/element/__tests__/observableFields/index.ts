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

        protected static get [attributeMap](): AttributeDescriptorMap<any> {
          return {
            attr: ["attr", String],
          };
        }

        protected static get [propertyMap](): PropertyDescriptorMap<any> {
          return {
            prop: null,
          };
        }

        protected static get [stateMap](): StateDescriptorMap<any> {
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

      el.setAttribute("attr", "oneAttr");

      expect(spy)
        .toHaveBeenCalledWith({
          attr: "zeroAttr",
          prop: "zeroProp",
        }, {
          state: "zeroState",
        });

      el.prop = "oneProp";

      expect(spy).toHaveBeenCalledWith({
        attr: "oneAttr",
        prop: "zeroProp",
      }, {
        state: "zeroState",
      });

      el.updateState("oneState");

      expect(spy).toHaveBeenCalledWith({
        attr: "oneAttr",
        prop: "oneProp",
      }, {
        state: "zeroState",
      });

      el.setAttribute("attr", "twoAttr");

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
