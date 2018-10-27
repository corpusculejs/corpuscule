// tslint:disable:max-classes-per-file
import useInitializer from "../src/useInitializer";

const useInitializerTest = () => {
  describe("useInitializer", () => {
    it("should create property initializer to init on class instantiation", () => {
      const decorator: PropertyDecorator = (descriptor: any) => ({
        ...descriptor,
        extras: [
          useInitializer<any>((instance) => {
            instance[descriptor.key] = instance[descriptor.key] * 2;
          }),
        ],
      });

      class Test {
        @decorator
        public prop: number = 10;
      }

      const test = new Test();
      expect(test.prop).toBe(20);
    });

    it("should work with static fields", () => {
      const decorator: PropertyDecorator = (descriptor: any) => ({
        ...descriptor,
        extras: [
          useInitializer<any>((instance) => {
            instance[descriptor.key] = instance[descriptor.key] * 2;
          }, true),
        ],
      });

      class Test { // tslint:disable-line:no-unnecessary-class
        @decorator
        public static prop: number = 10;
      }

      expect(Test.prop).toBe(20);
    });
  });
};

export default useInitializerTest;
