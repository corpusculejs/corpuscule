// tslint:disable:max-classes-per-file

import getSuperMethod from '../src/getSuperMethod';

const testGetSuperMethod = () => {
  describe('getSuperMethod', () => {
    let decorator: ReturnType<typeof getSuperMethod>;
    let decoratorSpy: jasmine.Spy;

    beforeEach(() => {
      decoratorSpy = jasmine.createSpy('decorator');
      decorator = ({elements, kind}: any): any => {
        const key = 'testMethod';
        const superTest = getSuperMethod(key, elements);

        return {
          elements: [...elements.filter(
            ({key: k}: any) => k !== key,
          ), {
            descriptor: {
              value(this: any): void {
                decoratorSpy();
                superTest(this); // tslint:disable-line:no-invalid-this
              },
            },
            key,
            kind: 'method',
            placement: 'prototype',
          }],
          kind,
        };
      };
    });

    it('should call currenly existing method if it exists', () => {
      const spy = jasmine.createSpy('testMethod');

      @decorator
      class Test {
        public testMethod(): void {
          spy();
        }
      }

      const test = new Test();

      test.testMethod();

      expect(spy).toHaveBeenCalled();
      expect(decoratorSpy).toHaveBeenCalled();
    });

    it('should call super testMethod if it does not exists in current class', () => {
      const spy = jasmine.createSpy('connectedCallback');

      class BaseTest {
        public testMethod(): void {
          spy();
        }
      }

      @decorator
      class Test extends BaseTest {
      }

      const test = new Test();

      test.testMethod();

      expect(spy).toHaveBeenCalled();
      expect(decoratorSpy).toHaveBeenCalled();
    });

    it('should call nothing if no super method exists', () => {
      @decorator
      class Test {} // tslint:disable-line:no-unnecessary-class

      const test = new Test();

      (test as any).testMethod();

      expect(decoratorSpy).toHaveBeenCalled();
    });
  });
};

export default testGetSuperMethod;
