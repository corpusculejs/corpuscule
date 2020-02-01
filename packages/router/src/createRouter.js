import UniversalRouter from 'universal-router';

const resolveRoute = async (context, params) => {
  const {chain, route} = context;

  chain.push({
    result:
      typeof route.action === 'function'
        ? await route.action(context, params)
        : null,
    route,
  });

  return !route.children ? chain : undefined;
};

const createRouter = (routes, options = {}) =>
  new UniversalRouter(routes, {
    ...options,
    resolveRoute,
  });

export default createRouter;
