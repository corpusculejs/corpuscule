// tslint:disable:await-promise max-classes-per-file
import {TemplateResult} from "lit-html";
// tslint:disable-next-line:no-implicit-dependencies
import uuid from "uuid/v4";
import {defineAndMount} from "../../../../test/utils";
import CorpusculeElement, {render, shouldUpdate} from "../../src";

const testForceUpdate = () => {
  describe("forceUpdate", () => {
    let elementName: string;

    beforeEach(() => {
      elementName = `x-${uuid()}`;
    });

    it("should trigger re-rendeing", async () => {
      const renderSpy = jasmine.createSpy("[render]");

      class Test extends CorpusculeElement {
        public static readonly is: string = elementName;

        protected [render](): TemplateResult | null {
          renderSpy();

          return null;
        }
      }

      const el = defineAndMount(Test);
      await el.elementRendering;

      await el.forceUpdate();
      await el.forceUpdate();

      expect(renderSpy).toHaveBeenCalledTimes(3);
    });

    it("should ignore [shouldUpdate]", async () => {
      const shouldUpdateSpy = jasmine.createSpy("[render]");

      class Test extends CorpusculeElement {
        public static readonly is: string = elementName;

        protected static [shouldUpdate](): boolean {
          shouldUpdateSpy();

          return true;
        }

        protected [render](): TemplateResult | null {
          return null;
        }
      }

      const el = defineAndMount(Test);
      await el.elementRendering;

      await el.forceUpdate();
      await el.forceUpdate();

      expect(shouldUpdateSpy).toHaveBeenCalledTimes(0);
    });

    it("should return promise that is equal to `elementRendering`", async () => {
      class Test extends CorpusculeElement {
        public static readonly is: string = elementName;

        protected [render](): TemplateResult | null {
          return null;
        }
      }

      const el = defineAndMount(Test);
      await el.elementRendering;

      expect(el.forceUpdate()).toBe(el.elementRendering);
    });
  });
};

export default testForceUpdate;
