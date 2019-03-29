// tslint:disable:max-classes-per-file
import UniversalRouter from 'universal-router';
import {Route} from 'universal-router/sync';
import {createSimpleContext, createTestingPromise, CustomElement} from '../../../test/utils';
import {api, outlet, provider} from '../src';

describe('@corpuscule/router', () => {
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

      [initialPromise, initialResolve] = createTestingPromise();
      [finalPromise, finalResolve] = createTestingPromise();
    });

    it('creates router outlet that fills layout & route on popstate event', async () => {
      @provider
      class Provider extends CustomElement {
        @api public readonly router: UniversalRouter = appRouter;
      }

      @outlet(routes)
      class Outlet extends CustomElement {
        public initial: boolean = true;
        public storage: string = '';

        @api public readonly route!: Route;

        @api
        public get layout(): string {
          return this.storage;
        }

        public set layout(value: string) {
          this.storage = value;

          if (this.initial) {
            initialResolve();
            this.initial = false;
          } else {
            finalResolve();
          }
        }
      }

      const [, outletElement] = await createSimpleContext(Provider, Outlet);

      await initialPromise;

      expect(outletElement.layout).toBe('Test');

      window.dispatchEvent(
        new PopStateEvent('popstate', {
          state: '/test2',
        }),
      );

      await finalPromise;

      expect(outletElement.layout).toBe('Test2');
      expect(outletElement.route).toBe(routes[1]);
    });

    it("ignores path that wasn't in the routes", async () => {
      appRouter.resolve.and.callFake((path: string) => {
        finalResolve();

        return fakeResolve(path);
      });

      @provider
      class Provider extends CustomElement {
        @api public readonly router: UniversalRouter = appRouter;
      }

      @outlet(routes)
      class Outlet extends CustomElement {
        public initial: boolean = true;
        public storage: string = '';

        @api public readonly route!: Route;

        @api
        public get layout(): string {
          return this.storage;
        }

        public set layout(value: string) {
          this.storage = value;

          if (this.initial) {
            initialResolve();
            this.initial = false;
          }
        }
      }

      const [, outletElement] = await createSimpleContext(Provider, Outlet);

      await initialPromise;

      expect(outletElement.layout).toBe('Test');

      window.dispatchEvent(
        new PopStateEvent('popstate', {
          state: '/nowhere',
        }),
      );

      await finalPromise;

      expect(outletElement.layout).toBe('Test');
    });

    it('ignores routes that are not in current component route list', async () => {
      appRouter.resolve.and.callFake((path: string) => {
        finalResolve();

        return fakeResolve(path);
      });

      @provider
      class Provider extends CustomElement {
        @api public readonly router: UniversalRouter = appRouter;
      }

      @outlet(routes)
      class Outlet extends CustomElement {
        public initial: boolean = true;
        public storage: string = '';

        @api public readonly route!: Route;

        @api
        public get layout(): string {
          return this.storage;
        }

        public set layout(value: string) {
          this.storage = value;

          if (this.initial) {
            initialResolve();
            this.initial = false;
          }
        }
      }

      const [, outletElement] = await createSimpleContext(Provider, Outlet);

      await initialPromise;

      expect(outletElement.layout).toBe('Test');

      window.dispatchEvent(
        new PopStateEvent('popstate', {
          state: '/other-route',
        }),
      );

      await finalPromise;

      expect(outletElement.layout).toBe('Test');
    });

    it("calls user's connectedCallback and disconnectedCallback methods", async () => {
      const connectedSpy = jasmine.createSpy('connectedCallback');
      const disconnectedSpy = jasmine.createSpy('disconnectedCallback');

      @provider
      class Provider extends CustomElement {
        @api public readonly router: UniversalRouter = appRouter;
      }

      @outlet(routes)
      class Outlet extends CustomElement {
        @api public readonly layout?: string;
        @api public readonly route?: Route;

        public connectedCallback(): void {
          connectedSpy();
        }

        public disconnectedCallback(): void {
          disconnectedSpy();
        }
      }

      const [, outletElement] = await createSimpleContext(Provider, Outlet);

      expect(connectedSpy).toHaveBeenCalled();

      outletElement.disconnectedCallback();

      expect(disconnectedSpy).toHaveBeenCalled();
    });

    it('does not throw an error if class already have own lifecycle element', () => {
      expect(() => {
        @outlet(routes)
        // @ts-ignore
        class Outlet extends CustomElement {
          @api public readonly layout?: string;
          @api public readonly route?: Route;

          public constructor() {
            super();
            this.connectedCallback = this.connectedCallback.bind(this);
            this.disconnectedCallback = this.disconnectedCallback.bind(this);
          }

          public connectedCallback(): void {} // tslint:disable-line:no-empty

          public disconnectedCallback(): void {} // tslint:disable-line:no-empty
        }
      }).not.toThrow();
    });
  });
});
