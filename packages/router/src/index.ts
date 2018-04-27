import UniversalRouter, {ActionContext, Options, Params, Route} from 'universal-router';
import createRoutingNodeDecorator, {RoutingBaseDecorator} from './createRoutingBaseDecorator';
import createUrlUtilsCreator, {UrlUtilsCreator} from './createUrlUtilsCreator';

export type RoutePush = (path: string, title?: string) => void;

const resolveRoute = (context: ActionContext, params: Params): [any, ActionContext] | undefined => {
  if (typeof context.route.action === 'function') {
    return [context.route.action(context, params), context];
  }

  return undefined;
};

const createRouterBindings = (routes: Route | ReadonlyArray<Route>, options: Options = {}): [
  RoutingBaseDecorator,
  RoutePush,
  UrlUtilsCreator
] => {
  const router = new UniversalRouter(routes as Route | Route[], {
    ...options,
    resolveRoute,
  });

  const push: RoutePush = (path, title = ''): void => {
    history.pushState({path}, title, path);
    dispatchEvent(new PopStateEvent('popstate', {state: history.state}));
  };

  const routingNodeDecorator = createRoutingNodeDecorator(router);
  const urlUtilsCreator = createUrlUtilsCreator(router, push);

  return [routingNodeDecorator, push, urlUtilsCreator];
};

export default createRouterBindings;
