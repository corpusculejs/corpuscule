// tslint:disable:max-classes-per-file no-unnecessary-class

import Registry from "../src/Registry";

const testRegistry = () => {
  fdescribe("Registry", () => {
    class Test {}

    let registry: Registry<any, string, string>;

    beforeEach(() => {
      registry = new Registry();
    });

    it("should get already existing record", () => {
      (registry as any).store.set(Test, new Map([["1", "2"]]));
      expect(registry.get(Test, "1")).toBe("2");
    });

    it("should add completely new record", () => {
      registry.set(Test, "1", "2");
      expect((registry as any).store.has(Test)).toBeTruthy();
      expect((registry as any).store.get(Test)).toEqual(new Map([["1", "2"]]));
    });

    it("should add second record to existing one", () => {
      registry.set(Test, "1", "2");
      registry.set(Test, "2", "3");
      expect((registry as any).store.get(Test)).toEqual(new Map([["1", "2"], ["2", "3"]]));
    });
  });
};

export default testRegistry;
