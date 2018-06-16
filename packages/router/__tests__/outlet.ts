// tslint:disable:max-classes-per-file
import UniversalRouter, {Routes} from "universal-router";
// tslint:disable-next-line:no-implicit-dependencies
import uuid from "uuid/v4";
import {BasicConsumer, BasicProvider, defineAndMountContext} from "../../../test/utils";
import {createRouter, layout, outlet, provider, router as $router} from "../src";

const outletTest = () => {
  describe("outlet", () => {
    const basicLocation = location.pathname;

    const childrenRoutes: Routes = [{
      action: () => "Child Root",
      path: "",
    }, {
      action: () => "Child Branch",
      path: "/child",
    }];

    const routes: Routes = [{
      action: () => "Test Root",
      path: "",
    }, {
      action: () => "Test Branch",
      path: `#test`,
    }, {
      children: childrenRoutes,
      path: "#parent",
    }];

    const router = createRouter(routes, {
      baseUrl: basicLocation,
    });

    it("should create a router outlet that contains initial layout", async () => {
      class Provider extends provider(BasicProvider) {
        public static is: string = `x-${uuid()}`;

        protected readonly [$router]: UniversalRouter = router;
      }

      class Test extends outlet(routes)(BasicConsumer) {
        public static is: string = `x-${uuid()}`;

        public readonly [layout]: string;
      }

      const [, o] = defineAndMountContext(Provider, Test);

      await o.resolvingPromise;

      expect(o[layout]).toBe("Test Root");
    });

    it("should get new layout on 'popstate' event", async () => {
      class Provider extends provider(BasicProvider) {
        public static is: string = `x-${uuid()}`;

        protected readonly [$router]: UniversalRouter = router;
      }

      class BasicTest extends BasicConsumer {
        public static is: string = `x-${uuid()}`;

        public readonly [layout]: string;
      }

      const Test = outlet(routes)(BasicTest); // tslint:disable-line:naming-convention

      const [, o] = defineAndMountContext(Provider, Test);

      dispatchEvent(new PopStateEvent("popstate", {state: `${basicLocation}#test`}));

      await o.resolvingPromise;

      expect(o[layout]).toBe("Test Branch");
    });

    it("should ignore layouts for another routes", async () => {
      class Provider extends provider(BasicProvider) {
        public static is: string = `x-${uuid()}`;

        protected readonly [$router]: UniversalRouter = router;
      }

      class Test extends outlet(routes)(BasicConsumer) {
        public static is: string = `x-${uuid()}`;

        public readonly [layout]: string;
      }

      class Child extends outlet(childrenRoutes)(BasicConsumer) {
        public static is: string = `x-${uuid()}`;

        public readonly [layout]: string;
      }

      const [, test, child] = defineAndMountContext(Provider, Test, Child);

      dispatchEvent(new PopStateEvent("popstate", {state: `${basicLocation}#parent`}));

      await child.resolvingPromise;

      expect(child[layout]).toBe("Child Root");

      dispatchEvent(new PopStateEvent("popstate", {state: `${basicLocation}#parent/child`}));

      await child.resolvingPromise;

      expect(child[layout]).toBe("Child Branch");
      expect(test[layout]).toBe("Test Root");
    });
  });
};

export default outletTest;
