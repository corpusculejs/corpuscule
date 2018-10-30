import UniversalRouter from 'universal-router';

const resolveRoute = (context, params) => {
  if (typeof context.route.action === 'function') {
    return [context.route.action(context, params), context];
  }

  return undefined;
};

const createRouter = (routes, options = {}) =>
  new UniversalRouter(routes, {
    ...options,
    resolveRoute,
  });

export default createRouter;
