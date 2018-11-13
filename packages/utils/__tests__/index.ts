import testAddToRegistry from './addToRegistry';
import testAsserts from './asserts';
import testDescriptors from './descriptors';
import testGetSuperMethod from './getSuperMethods';

describe('@corpuscule/utils', () => {
  testAddToRegistry();
  testAsserts();
  testDescriptors();
  testGetSuperMethod();
});
