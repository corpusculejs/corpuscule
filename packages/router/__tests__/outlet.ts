// tslint:disable:max-classes-per-file
import UniversalRouter from 'universal-router';
import {createMockedContextElements} from '../../../test/mocks/context';
import {HTMLElementMock} from '../../../test/utils';
import {layout, outlet, provider, router, RouterOutlet} from '../src';

const outletTest = () => {
  describe('outlet', () => {
    const routes = [
      {
        action: () => 'Test',
      },
      {
        action: () => 'Test2',
        path: '/test2',
      },
    ];

    const otherRoute = {
      action: () => 'Other',
    };

    const fakeResolve = (path: string) => {
      const [root, test2] = routes;

      switch (path) {
        case '/test2':
          return [test2.action(), {route: test2}];
        case '/nowhere':
          return undefined;
        case '/other-route':
          return [otherRoute.action(), {route: otherRoute}];
        default:
          return [root.action(), {route: root}];
      }
    };

    let initialResolve: () => void;
    let finalResolve: () => void;

    let initialPromise: Promise<void>;
    let finalPromise: Promise<void>;

    let appRouter: jasmine.SpyObj<UniversalRouter>;

    beforeEach(() => {
      appRouter = jasmine.createSpyObj('router', ['resolve']);

      appRouter.resolve.and.callFake(fakeResolve);

      initialPromise = new Promise(r => {
        initialResolve = r;
      });

      finalPromise = new Promise(r => {
        finalResolve = r;
      });
    });

    it('creates router outlet that fills layout on popstate event', async () => {
      @provider
      class Provider extends HTMLElementMock {
        public readonly [router]: UniversalRouter = appRouter;
      }

      @outlet(routes)
      class Outlet extends HTMLElementMock implements RouterOutlet<string> {
        public initial: boolean = true;
        public storage: string = '';

        public get [layout](): string {
          return this.storage;
        }

        public set [layout](value: string) {
          this.storage = value;

          if (this.initial) {
            initialResolve();
            this.initial = false;
          } else {
            finalResolve();
          }
        }
      }

      const [, outletElement] = createMockedContextElements(Provider, Outlet);

      await initialPromise;

      expect(outletElement[layout]).toBe('Test');

      window.dispatchEvent(
        new PopStateEvent('popstate', {
          state: '/test2',
        }),
      );

      await finalPromise;

      expect(outletElement[layout]).toBe('Test2');
    });

    it("ignores path that wasn't in the routes", async () => {
      appRouter.resolve.and.callFake((path: string) => {
        finalResolve();

        return fakeResolve(path);
      });

      @provider
      class Provider extends HTMLElementMock {
        public readonly [router]: UniversalRouter = appRouter;
      }

      @outlet(routes)
      class Outlet extends HTMLElementMock implements RouterOutlet<string> {
        public initial: boolean = true;
        public storage: string = '';

        public get [layout](): string {
          return this.storage;
        }

        public set [layout](value: string) {
          this.storage = value;

          if (this.initial) {
            initialResolve();
            this.initial = false;
          }
        }
      }

      const [, outletElement] = createMockedContextElements(Provider, Outlet);

      await initialPromise;

      expect(outletElement[layout]).toBe('Test');

      window.dispatchEvent(
        new PopStateEvent('popstate', {
          state: '/nowhere',
        }),
      );

      await finalPromise;

      expect(outletElement[layout]).toBe('Test');
    });

    it('ignores routes that are not in current component route list', async () => {
      appRouter.resolve.and.callFake((path: string) => {
        finalResolve();

        return fakeResolve(path);
      });

      @provider
      class Provider extends HTMLElementMock {
        public readonly [router]: UniversalRouter = appRouter;
      }

      @outlet(routes)
      class Outlet extends HTMLElementMock implements RouterOutlet<string> {
        public initial: boolean = true;
        public storage: string = '';

        public get [layout](): string {
          return this.storage;
        }

        public set [layout](value: string) {
          this.storage = value;

          if (this.initial) {
            initialResolve();
            this.initial = false;
          }
        }
      }

      const [, outletElement] = createMockedContextElements(Provider, Outlet);

      await initialPromise;

      expect(outletElement[layout]).toBe('Test');

      window.dispatchEvent(
        new PopStateEvent('popstate', {
          state: '/other-route',
        }),
      );

      await finalPromise;

      expect(outletElement[layout]).toBe('Test');
    });

    it("calls user's connectedCallback and disconnectedCallback methods", () => {
      const connectedSpy = jasmine.createSpy('connectedCallback');
      const disconnectedSpy = jasmine.createSpy('disconnectedCallback');

      @provider
      class Provider extends HTMLElementMock {
        public readonly [router]: UniversalRouter = appRouter;
      }

      @outlet(routes)
      class Outlet extends HTMLElementMock {
        public connectedCallback(): void {
          connectedSpy();
        }

        public disconnectedCallback(): void {
          disconnectedSpy();
        }
      }

      const [, outletElement] = createMockedContextElements(Provider, Outlet);

      expect(connectedSpy).toHaveBeenCalled();

      outletElement.disconnectedCallback();

      expect(disconnectedSpy).toHaveBeenCalled();
    });
  });
};

export default outletTest;
