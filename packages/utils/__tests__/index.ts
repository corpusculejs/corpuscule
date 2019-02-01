import testAsserts from './asserts';
import testDescriptors from './descriptors';
import testPropertyUtils from './propertyUtils';
import testSchedule from './scheduler';

describe('@corpuscule/utils', () => {
  testAsserts();
  testDescriptors();
  testPropertyUtils();
  testSchedule();
});
