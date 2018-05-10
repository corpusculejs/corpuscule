import UniversalRouter from 'universal-router';
import {RouterConnector} from './types';
import {updateRoute} from './utils';

const createRouterConnector = (router: UniversalRouter): RouterConnector => {
  const routerConnector: RouterConnector = routes => (target) => {
    const routeNode = target._routeNode;

    if (!routeNode) {
      throw new Error('routerNode is not specified');
    }

    const {
      connectedCallback: superConnectedCallback,
      disconnectedCallback: superDisconnectedCallback,
    } = target.prototype;

    target.prototype.connectedCallback = async function connectedCallback(this: any): Promise<void> {
      this.__updateRoute =
        async (e: PopStateEvent | string) =>
          updateRoute(router, routes, this, routeNode, e);

      window.addEventListener('popstate', this.__updateRoute);

      if (superConnectedCallback) {
        superConnectedCallback.call(this);
      }

      await this.__updateRoute(location.pathname);
    };

    target.prototype.disconnectedCallback = function disconnectedCallback(this: any): void {
      window.removeEventListener('popstate', this.__updateRoute);

      if (superDisconnectedCallback) {
        superDisconnectedCallback.call(this);
      }
    };

    return target;
  };

  // tslint:disable-next-line:no-var-before-return
  return routerConnector;
};

export default createRouterConnector;
