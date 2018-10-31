// tslint:disable:max-classes-per-file
import UniversalRouter, {Routes} from 'universal-router';
// tslint:disable-next-line:no-implicit-dependencies
import uuid from 'uuid/v4';
import {BasicConsumer, BasicProvider, defineAndMountContext} from '../../../test/utils';
import {
  createRouter,
  layout,
  outlet,
  provider,
  router as $router,
} from '../src';

const outletTest = () => {
  describe('outlet', () => {
    const basicLocation = location.pathname;

    const childrenRoutes: Routes = [{
      action: () => 'Child Root',
      path: '',
    }, {
      action: () => 'Child Branch',
      path: '/child',
    }];

    const routes: Routes = [{
      action: () => 'Test Root',
      path: '',
    }, {
      action: () => 'Test Branch',
      path: '#test',
    }, {
      children: childrenRoutes,
      path: '#parent',
    }];

    const router = createRouter(routes, {
      baseUrl: basicLocation,
    });

    it('should create a router outlet that contains initial layout', async () => {
      @provider
      class Provider extends BasicProvider {
        public static is: string = `x-${uuid()}`;

        protected readonly [$router]: UniversalRouter = router;
      }

      @outlet(routes)
      class Test extends BasicConsumer {
        public static is: string = `x-${uuid()}`;

        public readonly [layout]: string;
      }

      const [, o] = defineAndMountContext(Provider, Test);

      await (o as any).routeResolving;

      expect(o[layout]).toBe('Test Root');
    });

    it("should get new layout on 'popstate' event", async () => {
      @provider
      class Provider extends BasicProvider {
        public static is: string = `x-${uuid()}`;

        protected readonly [$router]: UniversalRouter = router;
      }

      @outlet(routes)
      class Test extends BasicConsumer {
        public static is: string = `x-${uuid()}`;

        public readonly [layout]: string;
      }

      const [, o] = defineAndMountContext(Provider, Test);

      dispatchEvent(new PopStateEvent('popstate', {state: `${basicLocation}#test`}));

      await (o as any).routeResolving;

      expect(o[layout]).toBe('Test Branch');
    });

    it('should ignore layouts for another routes', async () => {
      @provider
      class Provider extends BasicProvider {
        public static is: string = `x-${uuid()}`;

        protected readonly [$router]: UniversalRouter = router;
      }

      @outlet(routes)
      class Test extends BasicConsumer {
        public static is: string = `x-${uuid()}`;

        public readonly [layout]: string;
      }

      @outlet(childrenRoutes)
      class Child extends BasicConsumer {
        public static is: string = `x-${uuid()}`;

        public readonly [layout]: string;
      }

      const [, test, child] = defineAndMountContext(Provider, Test, Child);

      dispatchEvent(new PopStateEvent('popstate', {state: `${basicLocation}#parent`}));

      await (child as any).routeResolving;

      expect(child[layout]).toBe('Child Root');

      dispatchEvent(new PopStateEvent('popstate', {state: `${basicLocation}#parent/child`}));

      await (child as any).routeResolving;

      expect(child[layout]).toBe('Child Branch');
      expect(test[layout]).toBe('Test Root');
    });
  });
};

export default outletTest;
