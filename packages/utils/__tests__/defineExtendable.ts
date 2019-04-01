import defineExtendable from '../src/defineExtendable';

describe('@corpuscule/utils', () => {
  describe('defineExtendable', () => {
    let stringMethodSpy: jasmine.Spy;
    let stringMethodSuperSpy: jasmine.Spy;
    let symbolMethodSpy: jasmine.Spy;
    let symbolMethodSuperSpy: jasmine.Spy;
    let symbolMethodName: symbol;

    beforeEach(() => {
      stringMethodSpy = jasmine.createSpy('stringMethod');
      stringMethodSuperSpy = jasmine.createSpy('stringMethodSuper');
      symbolMethodSpy = jasmine.createSpy('symbolMethod');
      symbolMethodSuperSpy = jasmine.createSpy('symbolMethodSuper');

      symbolMethodName = Symbol();
    });

    it('defines methods if class is not extended', () => {
      class Test {
        public static __initializers: ReadonlyArray<(self: Test) => void> = [];
      }

      defineExtendable(
        Test,
        {
          test(...args: any[]): void {
            stringMethodSpy(...args);
          },
          [symbolMethodName](...args: any[]): void {
            symbolMethodSpy(...args);
          },
        },
        {
          test(...args: any[]): void {
            stringMethodSuperSpy(...args);
          },
          [symbolMethodName](...args: any[]): void {
            symbolMethodSuperSpy(...args);
          },
        },
      );

      const test: any = new Test();
      Test.__initializers.forEach(fn => fn(test));

      test.test(20);
      test[symbolMethodName](30);

      expect(stringMethodSpy).toHaveBeenCalledWith(20);
      expect(stringMethodSuperSpy).not.toHaveBeenCalled();
      expect(symbolMethodSpy).toHaveBeenCalledWith(30);
      expect(symbolMethodSuperSpy).not.toHaveBeenCalled();
    });

    it('defines supers if class is extended', () => {
      class Parent {
        public static __initializers: ReadonlyArray<(self: Parent) => void> = [];
      }

      class Child extends Parent {}

      defineExtendable(
        Parent,
        {
          test(...args: any[]): void {
            stringMethodSpy(...args);
          },
          [symbolMethodName](...args: any[]): void {
            symbolMethodSpy(...args);
          },
        },
        {
          test(...args: any[]): void {
            stringMethodSuperSpy(...args);
          },
          [symbolMethodName](...args: any[]): void {
            symbolMethodSuperSpy(...args);
          },
        },
      );

      const test: any = new Child();
      Parent.__initializers.forEach(fn => fn(test));

      test.test(20);
      test[symbolMethodName](30);

      expect(stringMethodSpy).not.toHaveBeenCalled();
      expect(stringMethodSuperSpy).toHaveBeenCalledWith(20);
      expect(symbolMethodSpy).not.toHaveBeenCalled();
      expect(symbolMethodSuperSpy).toHaveBeenCalledWith(30);
    });
  });
});
