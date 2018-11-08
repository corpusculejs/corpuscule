import testAddToRegistry from './addToRegistry';
import testAssertKind from './assertKind';
import testDescriptors from './descriptors';
import testGetSuperMethod from './getSuperMethod';

describe('@corpuscule/utils', () => {
  testAddToRegistry();
  testAssertKind();
  testDescriptors();
  testGetSuperMethod();
});
