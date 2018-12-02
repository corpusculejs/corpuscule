import UniversalRouter from 'universal-router';
import {universalRouterConstructorSpy} from '../../../test/mocks/universal-router';
import {createRouter} from '../src';

const createRouterTest = () => {
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

    describe('custom resolveRoute', () => {
      let resolveRoute: (context: unknown, params: unknown) => [string, unknown];

      beforeEach(() => {
        createRouter(routes, options);

        [, {resolveRoute}] = universalRouterConstructorSpy.calls.mostRecent().args;
      });

      it('gets route action result along with context', () => {
        const actionSpy = jasmine.createSpy('action');
        actionSpy.and.returnValue('Test');

        const ctx = {
          route: {
            action: actionSpy,
          },
        };

        const params = {param1: 1};

        expect(resolveRoute(ctx, params)).toEqual(['Test', ctx]);
        expect(actionSpy).toHaveBeenCalledWith(ctx, params);
      });

      it('gets undefined if action is not a function', () => {
        const ctx = {
          route: {
            action: null,
          },
        };

        const params = {param1: 1};

        expect(resolveRoute(ctx, params)).toBeUndefined();
      });
    });
  });
};

export default createRouterTest;
