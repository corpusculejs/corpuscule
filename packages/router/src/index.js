import {isProvider as isProviderAdvanced, provider as providerAdvanced} from '@corpuscule/context';
import apiAdvanced from './api';
import outletAdvanced from './outlet';
import {createRouterToken} from './utils';

export {apiAdvanced, isProviderAdvanced, outletAdvanced, providerAdvanced};

export {default as createUrl} from 'universal-router/generateUrls';
export {default as createRouter} from './createRouter';
export {default as Link} from './Link';
export {default as push} from './push';
export * from './tokens/lifecycle';

const defaultToken = createRouterToken();

export const api = apiAdvanced(defaultToken);
export const isProvider = target => isProviderAdvanced(defaultToken, target);
export const outlet = routes => outletAdvanced(defaultToken, routes);
export const provider = providerAdvanced(defaultToken);
