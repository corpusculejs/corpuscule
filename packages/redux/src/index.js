import {
  isProvider as isProviderAdvanced,
  provider as providerAdvanced,
  value as gearAdvanced,
} from '@corpuscule/context';
import dispatcherAdvanced from './dispatcher';
import reduxAdvanced from './redux';
import unitAdvanced from './unit';
import {createReduxToken} from './utils';

export {
  gearAdvanced,
  createReduxToken,
  dispatcherAdvanced,
  isProviderAdvanced,
  providerAdvanced,
  reduxAdvanced,
  unitAdvanced,
};

const defaultToken = createReduxToken();

export const gear = gearAdvanced(defaultToken);
export const dispatcher = dispatcherAdvanced(defaultToken);
export const isProvider = target => isProviderAdvanced(defaultToken, target);
export const provider = providerAdvanced(defaultToken);
export const redux = reduxAdvanced(defaultToken);
export const unit = getter => unitAdvanced(defaultToken, getter);
