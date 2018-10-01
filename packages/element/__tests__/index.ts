import corpusculeElement from "./CorpusculeElement";
import testElementDecorator from "./elementDecorator";

describe("@corpuscule/element", () => {
  afterEach(() => {
    document.body.innerHTML = ""; // tslint:disable-line:no-inner-html
  });

  corpusculeElement();
  testElementDecorator();
});
