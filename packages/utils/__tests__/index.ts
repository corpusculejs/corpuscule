import testAddToRegistry from './addToRegistry';
import testAssertKind from './assertKind';
import testGetSuperMethod from './getSuperMethod';

describe('@corpuscule/utils', () => {
  testAddToRegistry();
  testAssertKind();
  testGetSuperMethod();
});
