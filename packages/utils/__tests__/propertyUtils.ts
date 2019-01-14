// tslint:disable:no-unnecessary-class
import {call, getName, getValue, isPublic, setValue} from '../src/propertyUtils';

class PrivateName extends WeakMap {
  public readonly description: string;

  public constructor(description: string = '') {
    super();

    this.description = description;
  }
}

const testPropertyUtils = () => {
  describe('propertyUtils', () => {
    describe('isPublic', () => {
      it('returns true if property is string or number', () => {
        expect(isPublic('foo')).toBeTruthy();
        expect(isPublic(1)).toBeTruthy();
      });

      it('returns true if property is symbol', () => {
        const bar = Symbol();

        expect(isPublic(bar)).toBeTruthy();
      });

      it('returns false if property is WeakMap or PrivateName', () => {
        const baz = new PrivateName('baz');

        expect(isPublic(baz)).not.toBeTruthy();
      });
    });

    describe('getValue', () => {
      it('gets value of string or symbol property', () => {
        class Test {
          public foo: string = 'test';
        }

        const test = new Test();

        expect(getValue(test, 'foo')).toBe('test');
      });

      it('gets value of WeakMap or PrivateName property', () => {
        const foo = new PrivateName('foo');

        class Test {
          public constructor() {
            foo.set(this, 'test');
          }
        }

        const test = new Test();

        expect(getValue(test, foo)).toBe('test');
      });
    });

    describe('setValue', () => {
      it('sets value of string or symbol property', () => {
        class Test {
          public foo: string = 'test';
        }

        const test = new Test();

        setValue(test, 'foo', 'new test');

        expect(test.foo).toBe('new test');
      });

      it('sets value of WeakMap or PrivateName property', () => {
        const foo = new PrivateName('foo');

        class Test {
          public constructor() {
            foo.set(this, 'test');
          }
        }

        const test = new Test();

        setValue(test, foo, 'new test');

        expect(foo.get(test)).toBe('new test');
      });
    });

    describe('call', () => {
      it('calls method of string or symbol property', () => {
        const spy = jasmine.createSpy('foo');

        class Test {
          public foo(...args: number[]): void {
            spy(this, args);
          }
        }

        const test = new Test();

        call(test, 'foo', 1, 2, 3);

        expect(spy).toHaveBeenCalledWith(test, [1, 2, 3]);
      });

      it('calls method of WeakMap or PrivateName property', () => {
        const spy = jasmine.createSpy('foo');
        const foo = new PrivateName('foo');

        class Test {
          public constructor() {
            foo.set(this, (...args: any[]) => {
              spy(this, args);
            });
          }
        }

        const test = new Test();

        call(test, foo, 1, 2, 3);

        expect(spy).toHaveBeenCalledWith(test, [1, 2, 3]);
      });
    });

    describe('getName', () => {
      it('gets property itself if it is a string or number', () => {
        expect(getName('foo')).toBe('foo');
        expect(getName(1)).toBe(1);
      });

      it('gets description if property is a symbol', () => {
        expect(getName(Symbol('bar'))).toBe('bar');
      });

      it('gets description if property is PrivateName', () => {
        expect(getName(new PrivateName('baz'))).toBe('baz');
      });
    });
  });
};

export default testPropertyUtils;
