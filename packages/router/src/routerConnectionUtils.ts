import UniversalRouter, {Route} from 'universal-router';
import {RouterConstructor} from './types';
import {updateRoute} from './utils';

export const createRouterConnectionUtils = () => {
  let currentRouter: UniversalRouter;

  const provideRouter = (router: UniversalRouter): void => {
    currentRouter = router;
  };

  const connectRouter = (routes: ReadonlyArray<Route>) => <T extends RouterConstructor>(target: T): T => {
    if (!currentRouter) {
      throw new Error('Router is not provided');
    }

    const routeNode = target._routeNode;

    if (!routeNode) {
      throw new Error('routerNode is not specified');
    }

    return class WithRouter extends target {
      public async connectedCallback(): Promise<void> {
        window.addEventListener('popstate', this.__updateRoute);

        if (super.connectedCallback) {
          super.connectedCallback();
        }

        await this.__updateRoute(location.pathname);
      }

      public disconnectedCallback(): void {
        window.removeEventListener('popstate', this.__updateRoute);

        if (super.disconnectedCallback) {
          super.disconnectedCallback();
        }
      }

      private __updateRoute = async (e: PopStateEvent | string) =>
        updateRoute(
          currentRouter,
          routes,
          this,
          routeNode!,
          e,
        );
    };
  };

  return {
    connect: connectRouter,
    provide: provideRouter,
  };
};

export const {
  connect,
  provide,
} = createRouterConnectionUtils();
