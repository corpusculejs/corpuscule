import UniversalRouter from 'universal-router';
import {RouterConnector} from './types';
import {updateRoute} from './utils';

const createRouterConnector = (router: UniversalRouter): RouterConnector => {
  const routerConnector: RouterConnector = routes => (target) => {
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

      private __updateRoute =
        async (e: PopStateEvent | string) =>
          updateRoute(router, routes, this, routeNode!, e);
    };
  };

  // tslint:disable-next-line:no-var-before-return
  return routerConnector;
};

export default createRouterConnector;
