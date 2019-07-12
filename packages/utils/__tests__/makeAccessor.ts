import makeAccessor from '../src/makeAccessor';

describe('@corpuscule/utils', () => {
  describe('makeAccessor', () => {
    it('creates accessor from existing accessor', () => {
      const initializers: Array<(self: {}) => void> = [];

      class Test {
        private _foo: number = 1;

        public get foo(): number {
          return this._foo;
        }

        public set foo(v: number) {
          this._foo = v;
        }
      }

      const descriptor = Object.getOwnPropertyDescriptor(Test.prototype, 'foo')!;

      const accessorParts = makeAccessor(descriptor, initializers);

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

      expect(initializers).toEqual([]);
    });

    it('creates accessor for a class property', () => {
      const initializers: Array<(self: {}) => void> = [];

      const descriptor = {
        configurable: true,
        enumerable: true,
        initializer(): number {
          return 10;
        },
        writable: true,
      };

      const accessorParts = makeAccessor(descriptor, initializers);

      expect(accessorParts).toEqual({
        get: jasmine.any(Function),
        set: jasmine.any(Function),
      });

      expect(initializers).toContain(jasmine.any(Function));

      const test = {};

      const [initializer] = initializers;

      initializer(test);

      expect(accessorParts.get.call(test)).toBe(10);

      accessorParts.set.call(test, 20);

      expect(accessorParts.get.call(test)).toBe(20);
    });
  });
});
