import {isProvider as isProviderAdvanced} from '@corpuscule/context';
import gearAdvanced from './gear';
import outletAdvanced from './outlet';
import providerAdvanced from './provider';
import {createRouterToken} from './utils';

export {gearAdvanced, createRouterToken, isProviderAdvanced, outletAdvanced};

export {default as createUrl} from 'universal-router/generateUrls';
export {default as createRouter} from './createRouter';
export {default as Link} from './Link';
export {default as navigate} from './navigate';

const defaultToken = createRouterToken();

export const gear = gearAdvanced(defaultToken);
export const isProvider = klass => isProviderAdvanced(defaultToken, klass);
export const outlet = routes => outletAdvanced(defaultToken, routes);
export const provider = options => providerAdvanced(defaultToken, options);
