import testAttributeDecorator from './decorators/attribute';
import testComputingPair from './decorators/computingPair';
import testElementDecorator from './decorators/element';
import testPropertyDecorator from './decorators/property';
import testStateDecorator from './decorators/state';

describe('@corpuscule/element', () => {
  testAttributeDecorator();
  testComputingPair();
  testElementDecorator();
  testPropertyDecorator();
  testStateDecorator();
});
