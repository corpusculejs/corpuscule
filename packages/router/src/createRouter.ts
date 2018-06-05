import UniversalRouter, {ActionContext, Options, Params, Route} from "universal-router";

const resolveRoute = (context: ActionContext, params: Params): [any, ActionContext] | undefined => {
  if (typeof context.route.action === "function") {
    return [context.route.action(context, params), context];
  }

  return undefined;
};

const createRouter = (routes: Route | ReadonlyArray<Route>, options: Options = {}): UniversalRouter =>
  new UniversalRouter(routes as Route | Route[], {
    ...options,
    resolveRoute,
  });

export default createRouter;
