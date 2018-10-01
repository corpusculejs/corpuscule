import testCorpusculeElement from "./corpusculeElement";

describe("@corpuscule/element", () => {
  afterEach(() => {
    document.body.innerHTML = ""; // tslint:disable-line:no-inner-html
  });

  testCorpusculeElement();
});
