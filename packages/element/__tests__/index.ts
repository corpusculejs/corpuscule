import testAttributeDecorator from './decorators/attribute';
import testComputingPair from './decorators/computingPair';
import testElementDecorator from './decorators/element';

describe('@corpuscule/element', () => {
  testAttributeDecorator();
  testElementDecorator();
  testComputingPair();
});
