import createContext from '@corpuscule/context';
import createApiDecorator from './api';
import createOutletDecorator from './outlet';

export {default as createUrl} from 'universal-router/generateUrls';
export {default as createRouter} from './createRouter';
export {default as Link} from './Link';
export {default as push} from './push';
export * from './tokens/lifecycle';

export const createRouterContext = () => {
  const context = createContext();

  const shared = {
    layout: new WeakMap(),
    route: new WeakMap(),
  };

  return {
    api: createApiDecorator(context, shared),
    outlet: createOutletDecorator(context, shared),
    provider: context.provider,
  };
};

export const {api, outlet, provider} = createRouterContext();
