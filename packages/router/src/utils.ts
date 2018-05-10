import UniversalRouter, {ActionContext, Route} from 'universal-router';

export const updateRoute = async (
  router: UniversalRouter,
  routes: ReadonlyArray<Route>,
  instance: any,
  propertyName: string,
  e: PopStateEvent | string,
): Promise<void> => {
  const path = typeof e !== 'string'
    ? (e.state ? e.state.path : '')
    : e;

  const resolved: [any, ActionContext] | undefined = await router.resolve(path);

  if (resolved === undefined) {
    return;
  }

  const [result, context] = resolved;

  if (routes.includes(context.route)) {
    instance[propertyName] = result;
  }
};
