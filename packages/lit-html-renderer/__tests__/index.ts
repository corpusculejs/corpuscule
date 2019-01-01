import testRegularRender from './regular';
import testShadyRender from './shady';
import testWithCustomElement from './withCustomElement';

describe('@corpuscule/lit-html-renderer', () => {
  testRegularRender();
  testShadyRender();
  testWithCustomElement();
});
