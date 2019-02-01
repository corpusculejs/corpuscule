import testAsserts from './asserts';
import testDescriptors from './descriptors';
import testGetSupers from './getSupers';
import testPropertyUtils from './propertyUtils';
import testSchedule from './scheduler';
import testShallowEqual from './shallowEqual';

describe('@corpuscule/utils', () => {
  testAsserts();
  testDescriptors();
  testGetSupers();
  testPropertyUtils();
  testSchedule();
  testShallowEqual();
});
