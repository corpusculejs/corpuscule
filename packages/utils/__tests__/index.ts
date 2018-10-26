import assertKindTest from "./assertKind";
import getSuperMethodTest from "./getSuperMethod";
import testRegistry from "./Registry";
import useInitializerTest from "./useInitializer";

describe("@corpuscule/utils", () => {
  assertKindTest();
  useInitializerTest();
  getSuperMethodTest();
  testRegistry();
});
