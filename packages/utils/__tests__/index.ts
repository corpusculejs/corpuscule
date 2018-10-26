import addToRegistryTest from "./addToRegistry";
import assertKindTest from "./assertKind";
import getSuperMethodTest from "./getSuperMethod";
import useInitializerTest from "./useInitializer";

describe("@corpuscule/utils", () => {
  addToRegistryTest();
  assertKindTest();
  useInitializerTest();
  getSuperMethodTest();
});
