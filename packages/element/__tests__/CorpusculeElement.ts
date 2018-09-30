import lifecycle from "./lifecycle";
import observableFields from "./observableFields";

const corpusculeElement = () => {
  describe("CorpusculeElement", () => {
    afterEach(() => {
      const {body} = document;

      while (body.firstChild) {
        body.removeChild(body.firstChild);
      }
    });

    lifecycle();
    observableFields();
  });
};

export default corpusculeElement;
