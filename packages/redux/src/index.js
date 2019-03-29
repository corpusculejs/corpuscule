import {isProvider, provider as providerAdvanced, value as apiAdvanced} from '@corpuscule/context';
import dispatcherAdvanced from './dispatcher';
import reduxAdvanced from './redux';
import unitAdvanced from './unit';
import {createReduxToken} from './utils';

export {
  apiAdvanced,
  createReduxToken,
  dispatcherAdvanced,
  isProvider,
  providerAdvanced,
  reduxAdvanced,
  unitAdvanced,
};

const defaultToken = createReduxToken();

export const api = apiAdvanced(defaultToken);
export const dispatcher = dispatcherAdvanced(defaultToken);
export const provider = providerAdvanced(defaultToken);
export const redux = reduxAdvanced(defaultToken);
export const unit = getter => unitAdvanced(defaultToken, getter);
