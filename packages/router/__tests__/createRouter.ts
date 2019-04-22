import UniversalRouter, {Route} from 'universal-router';
import {universalRouterConstructorSpy} from '../../../test/mocks/universalRouter';
import {createRouter} from '../src';

interface RoutingChainElement {
  readonly result: unknown;
  readonly route: Route;
}

describe('@corpuscule/router', () => {
  describe('createRouter', () => {
    const routes = [
      {
        action: () => 'Test',
      },
    ];
    const options = {context: {}};

    it('creates instance of UniversalRouter with custom resolveRoute', () => {
      const router = createRouter(routes, options);
      expect(router).toEqual(jasmine.any(UniversalRouter));
      expect(universalRouterConstructorSpy).toHaveBeenCalledWith(routes, {
        ...options,
        resolveRoute: jasmine.any(Function),
      });
    });

    describe('resolveRoute', () => {
      let resolveRoute: (
        context: unknown,
        params: unknown,
      ) => Promise<ReadonlyArray<RoutingChainElement> | undefined>;

      beforeEach(() => {
        createRouter(routes, options);

        [, {resolveRoute}] = universalRouterConstructorSpy.calls.mostRecent().args;
      });

      it('builds chain of visited routes', async () => {
        const firstRoute = {
          action: jasmine.createSpy('firstAction').and.returnValue('Foo'),
        };

        const secondRoute = {
          action: jasmine.createSpy('secondAction').and.callFake(async () => 'Bar'),
        };

        const chain: readonly RoutingChainElement[] = [];

        const params = {param1: 1};

        await resolveRoute({chain, route: firstRoute}, params);
        await resolveRoute({chain, route: secondRoute}, params);

        expect(chain).toEqual([
          {
            result: 'Foo',
            route: firstRoute,
          },
          {
            result: 'Bar',
            route: secondRoute,
          },
        ]);

        expect(firstRoute.action).toHaveBeenCalledWith({chain, route: firstRoute}, params);
        expect(secondRoute.action).toHaveBeenCalledWith({chain, route: secondRoute}, params);
      });

      it('returns built chain if route does not have children', async () => {
        const route = {
          action: jasmine.createSpy('action').and.returnValue('Foo'),
        };

        const chain: readonly RoutingChainElement[] = [];

        const newChain = await resolveRoute({chain, route}, {param: 1});

        expect(newChain).toBe(chain);
        expect(newChain).toEqual([
          {
            result: 'Foo',
            route,
          },
        ]);
      });

      it('returns undefined if visited route has children', async () => {
        const route = {
          action: jasmine.createSpy('action').and.returnValue('Foo'),
          children: [],
        };

        const chain: readonly RoutingChainElement[] = [];

        const result = await resolveRoute({chain, route}, {param: 1});
        expect(result).toBeUndefined();
        expect(chain).toEqual([
          {
            result: 'Foo',
            route,
          },
        ]);
      });

      it('makes result null if action is not a function', async () => {
        const route = {};

        const chain: readonly RoutingChainElement[] = [];

        await resolveRoute({chain, route}, {param: 1});
        expect(chain).toEqual([
          {
            result: null,
            route,
          },
        ]);
      });
    });
  });
});
