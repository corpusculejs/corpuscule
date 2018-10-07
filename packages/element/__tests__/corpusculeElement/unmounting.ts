// tslint:disable:await-promise max-classes-per-file
import {TemplateResult} from "lit-html";
// tslint:disable-next-line:no-implicit-dependencies
import uuid from "uuid/v4";
import {defineAndMount} from "../../../../test/utils";
import CorpusculeElement, {didUnmount, render} from "../../src";

const testUnmounting = () => {
  describe("unmounting stage", () => {
    let elementName: string;

    beforeEach(() => {
      elementName = `x-${uuid()}`;
    });

    it("should call [didUnmount] when component is disconnected from DOM", async () => {
      const didUnmountSpy = jasmine.createSpy("[didUnmount]");

      class Test extends CorpusculeElement {
        public static readonly is: string = elementName;

        protected [didUnmount](): void {
          didUnmountSpy();
        }

        protected [render](): TemplateResult | null {
          return null;
        }
      }

      const el = defineAndMount(Test);
      await el.elementRendering;

      el.remove();

      expect(didUnmountSpy).toHaveBeenCalledTimes(1);
    });
  });
};

export default testUnmounting;
