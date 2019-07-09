import {
  isProvider as isProviderAdvanced,
  provider as providerAdvanced,
  value as gearAdvanced,
} from '@corpuscule/context';
import dispatcherAdvanced from './dispatcher';
import storeonAdvanced from './storeon';
import unitAdvanced from './unit';
import {createStoreonToken} from './utils';

export {
  gearAdvanced,
  createStoreonToken,
  dispatcherAdvanced,
  isProviderAdvanced,
  providerAdvanced,
  storeonAdvanced,
  unitAdvanced,
};

const defaultToken = createStoreonToken();

export const gear = gearAdvanced(defaultToken);
export const dispatcher = eventKey => dispatcherAdvanced(defaultToken, eventKey);
export const isProvider = target => isProviderAdvanced(defaultToken, target);
export const provider = providerAdvanced(defaultToken);
export const storeon = storeonAdvanced(defaultToken);
export const unit = getter => unitAdvanced(defaultToken, getter);
