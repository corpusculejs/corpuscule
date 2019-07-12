// tslint:disable:no-unbound-method
import reflectClassMethods from '../src/reflectClassMethods';

describe('@corpuscule/utils', () => {
  describe('reflectClassMethods', () => {
    it('creates an object with specified target methods if exist', () => {
      class Test {
        public method(): void {}

        public method2(): void {}

        public method3(): void {}
      }

      expect(reflectClassMethods(Test.prototype, ['method', 'method2'])).toEqual({
        method: Test.prototype.method,
        method2: Test.prototype.method2,
      });
    });

    it('uses fallback if specified method does not exist', () => {
      class Test {
        public method(): void {}
      }

      const fallbackForMethod2 = () => {};

      expect(
        reflectClassMethods(Test.prototype, ['method', 'method2'], {method2: fallbackForMethod2}),
      ).toEqual({
        method: Test.prototype.method,
        method2: fallbackForMethod2,
      });
    });

    it('uses empty function if there is no specified method or fallback', () => {
      class Test {
        public method(): void {}
      }

      expect(reflectClassMethods(Test.prototype, ['method', 'method2'])).toEqual({
        method: Test.prototype.method,
        method2: jasmine.any(Function),
      });
    });
  });
});
