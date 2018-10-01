import testCreateComputingEntanglement from "./computed";
import testCorpusculeElement from "./corpusculeElement";
import testElementDecorator from "./elementDecorator";

describe("@corpuscule/element", () => {
  afterEach(() => {
    document.body.innerHTML = ""; // tslint:disable-line:no-inner-html
  });

  testCorpusculeElement();
  testElementDecorator();
  testCreateComputingEntanglement();
});
