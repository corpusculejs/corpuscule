import testAttributeDecorator from './decorators/attribute';
import testComputingPair from './decorators/computingPair';
import testElementDecorator from './decorators/element';
import testInternalDecorator from './decorators/internal';
import testPropertyDecorator from './decorators/property';
import testWithCorpusculeElement from './withCorpusculeElement';

describe('@corpuscule/element', () => {
  testAttributeDecorator();
  testComputingPair();
  testElementDecorator();
  testPropertyDecorator();
  testInternalDecorator();
  testWithCorpusculeElement();
});
