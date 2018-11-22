import testAddToRegistry from './addToRegistry';
import testAsserts from './asserts';
import testDescriptors from './descriptors';
import testGetSuperMethod from './getSuperMethods';
import testSchedule from './scheduler';

describe('@corpuscule/utils', () => {
  testAddToRegistry();
  testAsserts();
  testDescriptors();
  testGetSuperMethod();
  testSchedule();
});
