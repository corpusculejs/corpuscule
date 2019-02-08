import testAttributeDecorator from './attribute';
import testComputingPair from './computingPair';
import testElementDecorator from './element';
import testInternalDecorator from './internal';
import testPropertyDecorator from './property';
import testQuery from './query';

describe('@corpuscule/element', () => {
  testAttributeDecorator();
  testComputingPair();
  testElementDecorator();
  testPropertyDecorator();
  testInternalDecorator();
  testQuery();
});
