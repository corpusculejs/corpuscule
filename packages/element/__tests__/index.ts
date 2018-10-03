import testCreateComputingEntanglement from "./computed";
import testCorpusculeElement from "./corpusculeElement";
import testDecorators from "./decorators";
import testSchedule from "./schedule";

describe("@corpuscule/element", () => {
  afterEach(() => {
    document.body.innerHTML = ""; // tslint:disable-line:no-inner-html
  });

  testCorpusculeElement();
  testDecorators();
  testCreateComputingEntanglement();
  testSchedule();
});
