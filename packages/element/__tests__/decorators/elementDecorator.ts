// tslint:disable:max-classes-per-file
// tslint:disable-next-line:no-implicit-dependencies
import uuid from "uuid/v4";
import {element} from "../../src";

const testElementDecorator = () => {
  describe("@element", () => {
    let elementName: string;

    beforeEach(() => {
      elementName = `x-${uuid()}`;
    });

    it("should define custom element", () => {
      @element(elementName)
      class Test extends HTMLElement {
      }

      expect(customElements.get(elementName)).toBe(Test);
    });

    it("should add \"is\" static getter to the class that contains element name", () => {
      @element(elementName)
      class Test extends HTMLElement {
        public static readonly is: string;
      }

      expect(Test.is).toBe(elementName);
    });
  });
};

export default testElementDecorator;
