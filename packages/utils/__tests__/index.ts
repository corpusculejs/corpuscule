import testAsserts from './asserts';
import testDescriptors from './descriptors';
import testGetSupers from './getSupers';
import testLifecycleDescriptors from './lifecycleDescriptors';
import testPropertyUtils from './propertyUtils';
import testSchedule from './scheduler';
import testShallowEqual from './shallowEqual';

describe('@corpuscule/utils', () => {
  testAsserts();
  testDescriptors();
  testGetSupers();
  testLifecycleDescriptors();
  testPropertyUtils();
  testSchedule();
  testShallowEqual();
});
