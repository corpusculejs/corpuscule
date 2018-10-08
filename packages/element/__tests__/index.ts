import testCreateComputingEntanglement from "./computed";
import testCorpusculeElement from "./corpusculeElement";
import testDecorators from "./decorators";
import testDhtml from "./dhtml";
import testScheduler from "./scheduler";

describe("@corpuscule/element", () => {
  afterEach(() => {
    document.body.innerHTML = ""; // tslint:disable-line:no-inner-html
  });

  testDhtml();
  testCorpusculeElement();
  testDecorators();
  testCreateComputingEntanglement();
  testScheduler();
});
