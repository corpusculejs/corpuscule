import testAttributeDecorator from './decorators/attribute';
import testComputingPair from './decorators/computingPair';
import testElementDecorator from './decorators/element';
import testInternalDecorator from './decorators/internal';
import testPropertyDecorator from './decorators/property';
import testScheduler from './scheduler';
import testWithCorpusculeElement from './withCorpusculeElement';

describe('@corpuscule/element', () => {
  testAttributeDecorator();
  testComputingPair();
  testElementDecorator();
  testPropertyDecorator();
  testScheduler();
  testInternalDecorator();
  testWithCorpusculeElement();
});
