import testDecorators from "./decorators";
import lifecycle from "./lifecycle";

const testCorpusculeElement = () => {
  describe("CorpusculeElement", () => {
    lifecycle();
    testDecorators();
  });
};

export default testCorpusculeElement;
