import testAddToRegistry from './addToRegistry';
import testAsserts from './asserts';
import testDescriptors from './descriptors';
import testPropertyUtils from './propertyUtils';
import testSchedule from './scheduler';

describe('@corpuscule/utils', () => {
  testAddToRegistry();
  testAsserts();
  testDescriptors();
  testPropertyUtils();
  testSchedule();
});
