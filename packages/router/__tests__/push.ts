import {push} from "../src";

const pushTest = () => {
  describe("push", () => {
    let historyStateSpy: jasmine.Spy;

    beforeEach(() => {
      spyOn(history, "pushState");
      historyStateSpy = spyOnProperty(history, "state").and.returnValue({path: "/test"});
    });

    it("should push new state to history", () => {
      push("/test");
      // tslint:disable-next-line:no-unbound-method
      expect(history.pushState).toHaveBeenCalledWith({path: "/test"}, "", "/test");
      expect(historyStateSpy).toHaveBeenCalled();
    });

    it("should allow to add title to a page", () => {
      push("/test", "Test");
      // tslint:disable-next-line:no-unbound-method
      expect(history.pushState).toHaveBeenCalledWith({path: "/test"}, "Test", "/test");
    });

    it("should dispatch 'popstate' event", (done) => {
      window.addEventListener("popstate", (e: PopStateEvent) => {
        expect(e.state).toEqual({path: "/test"});
        done();
      });

      push("/test");
    });
  });
};

export default pushTest;
