// tslint:disable:max-classes-per-file no-invalid-this no-unnecessary-class
import getSupers from '../src/getSupers';

// @ts-ignore
const createDecorator = <N extends string>(
  names: ReadonlyArray<N>,
  extractSupers: (supers: Record<N, Function>) => void,
  fallbacks?: Partial<Record<N, Function>>,
): ClassDecorator =>
  (({elements, kind}: any) => {
    const [supers, finisher] = getSupers(elements, names);

    extractSupers(supers);

    return {
      elements,
      finisher(target: unknown): void {
        finisher(target, fallbacks);
      },
      kind,
    };
  }) as any;

// @ts-ignore
const makeOwn = (spy: jasmine.Spy): PropertyDecorator => (descriptor: any) => ({
  ...descriptor,
  extras: [
    {
      ...descriptor,
      descriptor: {
        ...descriptor.descriptor,
        value(): void {
          descriptor.descriptor.value.call(this);
          spy(this);
        },
      },
      placement: 'own',
    },
  ],
});

const testGetSupers = () => {
  describe('getSupers', () => {
    it('calls method if its descriptor exists', () => {
      const fooSpy = jasmine.createSpy('foo');

      let supers: {readonly [key: string]: Function} = {};
      const decorator = createDecorator(['foo'], s => {
        supers = s;
      });

      @decorator
      class Test {
        public foo(): void {
          fooSpy(this);
        }
      }

      const test = new Test();
      supers.foo.call(test);

      expect(fooSpy).toHaveBeenCalledWith(test);
    });

    it('prefers bound method if its descriptor exist', () => {
      const fooSpy = jasmine.createSpy('foo');
      const boundFooSpy = jasmine.createSpy('bound foo');

      let supers: {readonly [key: string]: Function} = {};
      const decorator = createDecorator(['foo'], s => {
        supers = s;
      });

      @decorator
      class Test {
        @makeOwn(boundFooSpy)
        public foo(): void {
          fooSpy(this);
        }
      }

      const test = new Test();
      supers.foo.call(test);

      expect(fooSpy).toHaveBeenCalledWith(test);
      expect(boundFooSpy).toHaveBeenCalledWith(test);
    });

    it('ignores static methods even with the same name', () => {
      const staticFooSpy = jasmine.createSpy('staticFoo');

      let supers: {readonly [key: string]: Function} = {};
      const decorator = createDecorator(['foo'], s => {
        supers = s;
      });

      @decorator
      class Test {
        public static foo(): void {
          staticFooSpy(this);
        }
      }

      const test = new Test();
      supers.foo.call(test);

      expect(staticFooSpy).not.toHaveBeenCalled();
    });

    it('calls super method if exist and there is no descriptors', () => {
      const fooSpy = jasmine.createSpy('foo');

      let supers: {readonly [key: string]: Function} = {};
      const decorator = createDecorator(['foo'], s => {
        supers = s;
      });

      class Parent {
        public foo(): void {
          fooSpy(this);
        }
      }

      @decorator
      class Child extends Parent {}

      const child = new Child();
      supers.foo.call(child);

      expect(fooSpy).toHaveBeenCalledWith(child);
    });

    it('calls nothing if no super method available', () => {
      let supers: {readonly [key: string]: Function} = {};
      const decorator = createDecorator(['foo'], s => {
        supers = s;
      });

      @decorator
      class Test {}

      const test = new Test();

      expect(() => supers.foo.call(test)).not.toThrow();
    });

    it('allows to get multiple super methods', () => {
      const fooSpy = jasmine.createSpy('foo');
      const barSpy = jasmine.createSpy('bar');

      let supers: {readonly [key: string]: Function} = {};
      const decorator = createDecorator(['foo', 'bar'], s => {
        supers = s;
      });

      @decorator
      class Test {
        public foo(): void {
          fooSpy(this);
        }

        public bar(): void {
          barSpy(this);
        }
      }

      const test = new Test();

      supers.foo.call(test);
      supers.bar.call(test);

      expect(fooSpy).toHaveBeenCalledWith(test);
      expect(barSpy).toHaveBeenCalledWith(test);
    });

    it('allows to set defaults that will be executed if no super method exists', () => {
      const fallbackSpy = jasmine.createSpy('foo');

      let supers: {readonly [key: string]: Function} = {};
      const decorator = createDecorator(
        ['foo', 'bar'],
        s => {
          supers = s;
        },
        {
          foo(): void {
            fallbackSpy(this);
          },
        },
      );

      @decorator
      class Test {}

      const test = new Test();

      supers.foo.call(test);

      expect(fallbackSpy).toHaveBeenCalledWith(test);
    });

    it('works correctly if super method created for several classes in inheritance chain', () => {
      const fooSpy = jasmine.createSpy('foo');

      let supers: {readonly [key: string]: Function} = {};
      const decorator = createDecorator(['foo'], s => {
        supers = s;
      });

      class GrandParent {
        public state: number = 1;

        public foo(): void {
          fooSpy(this.state);
        }
      }

      @decorator
      class Parent extends GrandParent {
        public state: number = 2;
      }

      @decorator
      class Child extends Parent {
        public state: number = 3;
      }

      const child = new Child();
      supers.foo.call(child);

      expect(fooSpy).toHaveBeenCalledWith(3);
    });
  });
};

export default testGetSupers;
