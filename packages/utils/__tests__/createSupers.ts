// tslint:disable:max-classes-per-file no-invalid-this no-unnecessary-class
import createSupers, {CreateSupersOption} from '../src/createSupers';

const createDecorator = (options: {readonly [key: string]: CreateSupersOption}): ClassDecorator =>
  (({elements, kind}: any) => {
    const supers = createSupers(elements, options);

    return {
      elements: [...elements, ...supers],
      kind,
    };
  }) as any;

const testBind = (spy: jasmine.Spy): PropertyDecorator => (descriptor: any) => ({
  ...descriptor,
  extras: [
    {
      descriptor: {
        configurable: true,
      },
      initializer(): () => void {
        return () => {
          descriptor.descriptor.value.call(this);
          spy();
        };
      },
      key: descriptor.key,
      kind: 'field',
      placement: 'own',
    },
  ],
});

const testCreateSupers = () => {
  fdescribe('createSupers', () => {
    it('calls method if its descriptor exists', () => {
      const fooSpy = jasmine.createSpy('foo');

      const decorator = createDecorator({
        foo: {key: 'superFoo'},
      });

      @decorator
      class Test {
        public foo(): void {
          fooSpy();
        }
      }

      const test: any = new Test();
      test.superFoo();

      expect(fooSpy).toHaveBeenCalled();
    });

    it('prefers bound method if its descriptor exist', () => {
      const fooSpy = jasmine.createSpy('foo');
      const boundFooSpy = jasmine.createSpy('bound foo');

      const decorator = createDecorator({
        foo: {key: 'superFoo'},
      });

      @decorator
      class Test {
        @testBind(boundFooSpy)
        public foo(): void {
          fooSpy();
        }
      }

      const test: any = new Test();
      test.superFoo();

      expect(fooSpy).toHaveBeenCalled();
      expect(boundFooSpy).toHaveBeenCalled();
    });

    it('calls super method if exist and there is no descriptors', () => {
      const fooSpy = jasmine.createSpy('foo');

      const decorator = createDecorator({
        foo: {key: 'superFoo'},
      });

      class Parent {
        public foo(): void {
          fooSpy();
        }
      }

      @decorator
      class Child extends Parent {}

      const child: any = new Child();
      child.superFoo();

      expect(fooSpy).toHaveBeenCalled();
    });

    it('calls nothing if no super method available', () => {
      const decorator = createDecorator({
        foo: {key: 'superFoo'},
      });

      @decorator
      class Test {}

      const test: any = new Test();

      expect(() => test.superFoo()).not.toThrow();
    });

    it('allows to get multiple super methods', () => {
      const fooSpy = jasmine.createSpy('foo');
      const barSpy = jasmine.createSpy('bar');

      const decorator = createDecorator({
        bar: {key: 'superBar'},
        foo: {key: 'superFoo'},
      });

      @decorator
      class Test {
        public foo(): void {
          fooSpy();
        }

        public bar(): void {
          barSpy();
        }
      }

      const test: any = new Test();

      test.superFoo();
      test.superBar();

      expect(fooSpy).toHaveBeenCalled();
      expect(barSpy).toHaveBeenCalled();
    });

    it('allows to set defaults that will be executed if no super method exists', () => {
      const fallbackSpy = jasmine.createSpy('foo');

      const decorator = createDecorator({
        foo: {
          fallback(): void {
            fallbackSpy();
          },
          key: 'superFoo',
        },
      });

      @decorator
      class Test {}

      const test: any = new Test();

      test.superFoo();

      expect(fallbackSpy).toHaveBeenCalled();
    });

    it('works correctly if super method created for several classes in inheritance chain', () => {
      const fooSpy = jasmine.createSpy('foo');

      const decorator = createDecorator({
        foo: {key: 'superFoo'},
      });

      class GrandParent {
        public foo(): void {
          fooSpy();
        }
      }

      @decorator
      class Parent extends GrandParent {}

      @decorator
      class Child extends Parent {}

      const child: any = new Child();
      child.superFoo();

      expect(fooSpy).toHaveBeenCalled();
    });
  });
};

export default testCreateSupers;
