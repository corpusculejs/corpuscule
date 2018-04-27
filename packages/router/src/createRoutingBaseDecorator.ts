import UniversalRouter, {ActionContext, Route} from 'universal-router';

export type RoutingBaseDecorator = (routes: ReadonlyArray<Route>) => (target: any, propertyName: string) => void;

const createRoutingBaseDecorator = (router: UniversalRouter): RoutingBaseDecorator =>
  routes => (prototype, propertyName) => {
    const routeUpdaters = new WeakMap<any, (e: PopStateEvent) => Promise<void>>();

    async function updateRoute(this: any, e: PopStateEvent | string): Promise<void> {
      const path = typeof e === 'string'
        ? e
        : (e.state ? e.state.path : '');

      const resolved: [any, ActionContext] | undefined = await router.resolve(path);

      if (resolved === undefined) {
        return;
      }

      const [result, context] = resolved;

      if (routes.includes(context.route)) {
        this[propertyName] = result;
      }
    }

    const {
      connectedCallback: superConnectedCallback,
      disconnectedCallback: superDisconnectedCallback,
    } = prototype;

    prototype.connectedCallback = async function connectedCallback(this: any): Promise<void> {
      const boundRouteUpdater = updateRoute.bind(this);

      routeUpdaters.set(this, boundRouteUpdater);
      window.addEventListener('popstate', boundRouteUpdater);

      if (superConnectedCallback) {
        superConnectedCallback.call(this);
      }

      await boundRouteUpdater(location.pathname);
    };

    prototype.disconnectedCallback = function disconnectedCallback(this: any): void {
      window.removeEventListener('popstate', routeUpdaters.get(this)!);

      if (superDisconnectedCallback) {
        superDisconnectedCallback.call(this);
      }
    };
  };

export default createRoutingBaseDecorator;
