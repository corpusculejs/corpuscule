import createRouterTest from './createRouter';
import linkTest from './Link';
import outletTest from './outlet';
import pushTest from './push';

describe('@corpuscule/router', () => {
  afterEach(() => {
    document.body.innerHTML = ''; // tslint:disable-line:no-inner-html
  });

  createRouterTest();
  linkTest();
  outletTest();
  pushTest();
});
