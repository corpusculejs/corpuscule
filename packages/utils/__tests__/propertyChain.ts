// tslint:disable:max-classes-per-file
import {getDescriptorChainValues, getPropertyChainDescriptors} from "../src/propertyChain";

const propertyChainTests = () => {
  describe("propertyChain", () => {
    describe("getPropertyChainDescriptors", () => {
      it("should get descriptors for property chain", () => {
        class A {
          public get getter(): string {
            return "test";
          }
        }

        class B extends A {
          public get getter(): string {
            return "test2";
          }
        }

        const b = new B();

        const descriptors = getPropertyChainDescriptors(b, "getter");

        expect(descriptors).toEqual([
          Object.getOwnPropertyDescriptor(B.prototype, "getter")!,
          Object.getOwnPropertyDescriptor(A.prototype, "getter")!,
        ]);
      });
    });

    describe("getDescriptorChainValues", () => {
      class A {
        private arr1: ReadonlyArray<number> = [1, 2, 3];
        private obj1: {readonly [key: string]: number} = {
          a: 1,
          b: 2,
        };

        public get getter(): string {
          return "test";
        }

        public get getterArr(): ReadonlyArray<number> {
          return this.arr1;
        }

        public get getterObj(): {readonly [key: string]: number} {
          return this.obj1;
        }
      }

      class B extends A {
        private arr2: ReadonlyArray<number> = [4, 5, 6];
        private obj2: {readonly [key: string]: number} = {
          c: 3,
          d: 4,
        };

        public get getter(): string {
          return "test2";
        }

        public get getterArr(): ReadonlyArray<number> {
          return this.arr2;
        }

        public get getterObj(): {readonly [key: string]: number} {
          return this.obj2;
        }
      }

      it("should get values from a descriptor chain", () => {
        const b = new B();

        const descriptors = [
          Object.getOwnPropertyDescriptor(B.prototype, "getter")!,
          Object.getOwnPropertyDescriptor(A.prototype, "getter")!,
        ];

        const values = getDescriptorChainValues(descriptors, {instance: b});

        expect(values).toEqual(["test2", "test"]);
      });

      it("should work with static properties", () => {
        class AA { // tslint:disable-line:no-unnecessary-class
          public static prop: number = 10;
        }

        class BB extends AA {
          public static prop: number = 20;
        }

        const descriptors = [
          Object.getOwnPropertyDescriptor(BB, "prop")!,
          Object.getOwnPropertyDescriptor(AA, "prop")!,
        ];

        const values = getDescriptorChainValues(descriptors);
        expect(values).toEqual([20, 10]);
      });

      it("should work with plain objects", () => {
        const obj = Object.create({
          prop: 10,
        });

        obj.prop = 20;

        const descriptors = [
          Object.getOwnPropertyDescriptor(obj, "prop")!,
          Object.getOwnPropertyDescriptor(Object.getPrototypeOf(obj), "prop")!,
        ];

        const values = getDescriptorChainValues(descriptors);
        expect(values).toEqual([20, 10]);
      });

      describe("merge", () => {
        it("should allow to merge arrays", () => {
          const b = new B();

          const descriptors = [
            Object.getOwnPropertyDescriptor(B.prototype, "getterArr")!,
            Object.getOwnPropertyDescriptor(A.prototype, "getterArr")!,
          ];

          const values = getDescriptorChainValues(descriptors, {
            instance: b,
            merge: true,
          });

          expect(values).toEqual([4, 5, 6, 1, 2, 3]);
        });

        it("should allow to merge objects", () => {
          const b = new B();

          const descriptors = [
            Object.getOwnPropertyDescriptor(B.prototype, "getterObj")!,
            Object.getOwnPropertyDescriptor(A.prototype, "getterObj")!,
          ];

          const values = getDescriptorChainValues(descriptors, {
            instance: b,
            merge: true,
          });

          expect(values).toEqual({
            a: 1,
            b: 2,
            c: 3,
            d: 4,
          });
        });
      });
    });
  });
};

export default propertyChainTests;
