import testAddToRegistry from './addToRegistry';
import testAsserts from './asserts';
import testCreateDualDescriptor from './createDualDescriptor';
import testDescriptors from './descriptors';
import testGetSuperMethod from './getSuperMethods';

describe('@corpuscule/utils', () => {
  testAddToRegistry();
  testAsserts();
  testCreateDualDescriptor();
  testDescriptors();
  testGetSuperMethod();
});
