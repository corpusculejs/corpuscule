import {
  isProvider as isProviderAdvanced,
  provider as providerAdvanced,
  value as apiAdvanced,
} from '@corpuscule/context';
import dispatcherAdvanced from './dispatcher';
import storeonAdvanced from './storeon';
import unitAdvanced from './unit';
import {createStoreonToken} from './utils';

export {
  apiAdvanced,
  createStoreonToken,
  dispatcherAdvanced,
  isProviderAdvanced,
  providerAdvanced,
  storeonAdvanced,
  unitAdvanced,
};

const defaultToken = createStoreonToken();

export const api = apiAdvanced(defaultToken);
export const dispatcher = eventKey => dispatcherAdvanced(defaultToken, eventKey);
export const isProvider = target => isProviderAdvanced(defaultToken, target);
export const provider = providerAdvanced(defaultToken);
export const storeon = storeonAdvanced(defaultToken);
export const unit = getter => unitAdvanced(defaultToken, getter);
