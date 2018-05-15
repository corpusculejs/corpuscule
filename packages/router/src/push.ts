import {RouterPush} from './types';

const push: RouterPush = (path, title = '') => {
  history.pushState({path}, title, path);
  dispatchEvent(new PopStateEvent('popstate', {state: history.state}));
};

export default push;
