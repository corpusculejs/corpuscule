import testCreateComputingEntanglement from "./computed";
import testCorpusculeElement from "./corpusculeElement";
import testDecorators from "./decorators";
import testScheduler from "./schedule";

describe("@corpuscule/element", () => {
  afterEach(() => {
    document.body.innerHTML = ""; // tslint:disable-line:no-inner-html
  });

  testCorpusculeElement();
  testDecorators();
  testCreateComputingEntanglement();
  testScheduler();
});
