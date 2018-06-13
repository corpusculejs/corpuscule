import {Link} from "../src";

const linkTest = () => {
  describe("Link", () => {
    let link: Link;

    beforeEach(() => {
      link = document.createElement("a", {is: Link.is}) as Link;
      link.href = "/test";

      spyOn(history, "pushState");
      spyOnProperty(history, "state").and.returnValue({path: "/test"});
    });

    afterEach(() => {
      link.remove();
    });

    it("should be accessible through 'document.createElement'", () => {
      expect(link).toEqual(jasmine.any(Link));
    });

    it("should dispatch PopStateEvent with current history state by click", (done) => {
      document.body.appendChild(link);
      window.addEventListener("popstate", (e: PopStateEvent) => {
        expect(e.state).toEqual({path: "/test"});
        done();
      });

      link.click();
    });

    it("should prevent default action for a anchor element", (done) => {
      document.body.appendChild(link);
      link.addEventListener("click", (e) => {
        expect(e.defaultPrevented).toBeTruthy();
        done();
      });

      link.click();
    });
  });
};

export default linkTest;
