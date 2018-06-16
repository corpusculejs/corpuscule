import corpusculeElement from "./CorpusculeElement";

describe("@corpuscule/element", () => {
  afterEach(() => {
    document.body.innerHTML = ""; // tslint:disable-line:no-inner-html
  });

  corpusculeElement();
});
