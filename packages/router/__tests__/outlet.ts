// tslint:disable:max-classes-per-file
import UniversalRouter, {Route} from "universal-router";
// tslint:disable-next-line:no-implicit-dependencies
import uuid from "uuid/v4";
import {BasicConsumer, BasicProvider, defineAndMountContext} from "../../../test/utils";
import {createRouter, layout, outlet, provider, router as $router} from "../src";

const outletTest = () => {
  describe("outlet", () => {
    const basicLocation = location.pathname;

    const routes: ReadonlyArray<Route> = [
      {
        action: () => "Test Root",
        path: "",
      },
      {
        action: () => "Test Branch",
        path: `#test`,
      },
    ];

    const router = createRouter(routes, {
      baseUrl: basicLocation,
    });

    it("should create a router outlet that contains initial layout", async () => {
      @provider
      class Provider extends BasicProvider {
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

    it("should react to a 'popstate' event and ", async () => {
      class Provider extends provider(BasicProvider) {
        public static is: string = `x-${uuid()}`;

        protected readonly [$router]: UniversalRouter = router;
      }

      class Test extends outlet(routes)(BasicConsumer) {
        public static is: string = `x-${uuid()}`;

        public readonly [layout]: string;
      }

      const [, o] = defineAndMountContext(Provider, Test);

      dispatchEvent(new PopStateEvent("popstate", {state: `${basicLocation}#test`}));

      await o.resolvingPromise;

      expect(o[layout]).toBe("Test Branch");
    });
  });
};

export default outletTest;
