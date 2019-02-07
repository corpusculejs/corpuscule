import createRouterTest from './createRouter';
import linkTest from './Link';
import outletTest from './outlet';
import pushTest from './push';

describe('@corpuscule/router', () => {
  createRouterTest();
  linkTest();
  outletTest();
  pushTest();
});
