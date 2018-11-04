import testAttributeDecorator from './decorators/attribute';
import testElementDecorator from './decorators/element';

describe('@corpuscule/element', () => {
  testAttributeDecorator();
  testElementDecorator();
});
