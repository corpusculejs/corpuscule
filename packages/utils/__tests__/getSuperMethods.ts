import {ExtendedPropertyDescriptor} from '@corpuscule/typings';

// tslint:disable:max-classes-per-file
import getSuperMethods from '../src/getSuperMethods';

const testGetSuperMethod = () => {
  describe('getSuperMethods', () => {
    it('calls method descriptor if it exists', () => {
      const methodSpy = jasmine.createSpy('method');

      const elements: ReadonlyArray<ExtendedPropertyDescriptor> = [
        {
          descriptor: {value: methodSpy},
          key: 'method',
          kind: 'method',
          placement: 'prototype',
        },
      ];

      const [superMethod] = getSuperMethods(elements, ['method']);

      superMethod();
      expect(methodSpy).toHaveBeenCalled();
    });

    it('calls super method if exist', () => {
      const methodSpy = jasmine.createSpy('method');

      class Basic {
        public method(): void {
          methodSpy();
        }
      }

      class Test extends Basic {}

      const test = new Test();

      const [superMethod] = getSuperMethods([], ['method']);

      superMethod.call(test);
      expect(methodSpy).toHaveBeenCalled();
    });

    it('calls nothing if no super method available', () => {
      const [superMethod] = getSuperMethods([], ['method']);
      expect(() => superMethod.call({})).not.toThrow();
    });

    it('allows to get multiple super methods', () => {
      const method1Spy = jasmine.createSpy('method1');
      const method2Spy = jasmine.createSpy('method2');

      const elements: ReadonlyArray<ExtendedPropertyDescriptor> = [
        {
          descriptor: {value: method1Spy},
          key: 'method1',
          kind: 'method',
          placement: 'prototype',
        },
        {
          descriptor: {value: method2Spy},
          key: 'method2',
          kind: 'method',
          placement: 'prototype',
        },
      ];

      const [superMethod1, superMethod2] = getSuperMethods(
        elements,
        ['method1', 'method2'],
      );

      superMethod1();
      expect(method1Spy).toHaveBeenCalled();

      superMethod2();
      expect(method2Spy).toHaveBeenCalled();
    });

    it('allows to set defaults that will be executed if no super method exists', () => {
      const methodSpy = jasmine.createSpy('method');

      const [superMethod] = getSuperMethods([], ['method'], {
        method(): void {
          methodSpy();
        },
      });

      superMethod();
      expect(methodSpy).toHaveBeenCalled();
    });

    it('works correctly if super method created for several classes in inheritance chain', () => {
      const methodSpy = jasmine.createSpy('method');

      const [superMethod] = getSuperMethods([], ['method']);

      class PreBasic {
        public method(): void {
          methodSpy();
        }
      }

      class Basic extends PreBasic {
        public method(): void {
          superMethod.call(this);
        }
      }

      class Test extends Basic {}

      const test = new Test();

      superMethod.call(test);
      expect(methodSpy).toHaveBeenCalled();
    });
  });
};

export default testGetSuperMethod;
