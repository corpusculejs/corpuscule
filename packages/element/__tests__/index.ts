import testAttributeDecorator from './decorators/attribute';
import testComputingPair from './decorators/computingPair';
import testElementDecorator from './decorators/element';
import testPropertyDecorator from './decorators/property';
import testStateDecorator from './decorators/state';
import testScheduler from './scheduler';
import testWithCorpusculeElement from './withCorpusculeElement';

describe('@corpuscule/element', () => {
  testAttributeDecorator();
  testComputingPair();
  testElementDecorator();
  testPropertyDecorator();
  testScheduler();
  testStateDecorator();
  testWithCorpusculeElement();
});
