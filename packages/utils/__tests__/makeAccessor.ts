import makeAccessor from '../src/makeAccessor';

describe('@corpuscule/utils', () => {
  describe('makeAccessor', () => {
    it('creates accessor from existing accessor', () => {
      class Test {
        public _foo: number = 1;

        public get foo(): number {
          return this._foo;
        }

        public set foo(v: number) {
          this._foo = v;
        }
      }

      const descriptor = Object.getOwnPropertyDescriptor(Test.prototype, 'foo')!;

      const accessorParts = makeAccessor<number>(Test, descriptor);

      expect(accessorParts).toEqual({
        configurable: true,
        enumerable: false,
        get: jasmine.any(Function),
        set: jasmine.any(Function),
      });

      const test = new Test();

      expect(accessorParts.get.call(test)).toBe(1);

      accessorParts.set.call(test, 10);

      expect(test.foo).toBe(10);
    });

    it('creates accessor for a class property', () => {
      class Test {
        public static __initializers: Array<(self: Test) => void> = [];

        public foo?: number;
      }

      const descriptor = {
        configurable: true,
        enumerable: true,
        initializer(): number {
          return 10;
        },
        writable: true,
      };

      const accessorParts = makeAccessor<number>(Test, descriptor);

      expect(accessorParts).toEqual({
        get: jasmine.any(Function),
        set: jasmine.any(Function),
      });

      expect(Test.__initializers).toContain(jasmine.any(Function));

      const test = new Test();

      const [initializer] = Test.__initializers;

      expect(test.foo).toBeUndefined();

      initializer(test);

      expect(accessorParts.get.call(test)).toBe(10);

      accessorParts.set.call(test, 20);

      expect(accessorParts.get.call(test)).toBe(20);
    });
  });
});
