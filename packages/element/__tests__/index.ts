import corpusculeElement from "./CorpusculeElement";
import decorators from "./decorators";

describe("@corpuscule/element", () => {
  afterEach(() => {
    document.body.innerHTML = ""; // tslint:disable-line:no-inner-html
  });

  corpusculeElement();
  decorators();
});
