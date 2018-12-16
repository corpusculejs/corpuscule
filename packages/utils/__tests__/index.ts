import testAddToRegistry from './addToRegistry';
import testAsserts from './asserts';
import testCreateSupers from './createSupers';
import testDescriptors from './descriptors';
import testSchedule from './scheduler';

describe('@corpuscule/utils', () => {
  testAddToRegistry();
  testAsserts();
  testDescriptors();
  testCreateSupers();
  testSchedule();
});
