// tslint:disable:no-unnecessary-class
import {ExtendedPropertyDescriptor} from '@corpuscule/typings';
import {method} from '../src/lifecycleDescriptors';

const testLifecycleDescriptors = () => {
  describe('method', () => {
    let methodSpy: jasmine.Spy;
    let superSpies: jasmine.SpyObj<{test: Function}>;
    let constructor: object;
    let result: [ExtendedPropertyDescriptor, ExtendedPropertyDescriptor];

    beforeEach(() => {
      methodSpy = jasmine.createSpy('method');
      superSpies = jasmine.createSpyObj('supers', ['test']);

      constructor = {};
      result = method({key: 'test', method: methodSpy}, superSpies, () => constructor);
    });

    it('creates method and field descriptors', () => {
      expect(result).toEqual([
        {
          descriptor: {
            configurable: true,
            enumerable: true,
            value: jasmine.any(Function),
            writable: true,
          },
          extras: undefined,
          finisher: undefined,
          key: 'test',
          kind: 'method',
          placement: 'prototype',
        },
        {
          descriptor: {
            configurable: true,
            enumerable: true,
            writable: true,
          },
          extras: undefined,
          finisher: undefined,
          initializer: jasmine.any(Function),
          key: jasmine.any(Symbol) as any,
          kind: 'field',
          placement: 'own',
        },
      ]);
    });

    it('runs "method" if class constructor is equal to "constructor" param and "super" if not', () => {
      const withConstructor = {constructor};
      const initialized = result[1].initializer!.call(withConstructor) as Function;

      initialized();

      expect(methodSpy).toHaveBeenCalled();

      const withoutConstructor = {};
      const initialized2 = result[1].initializer!.call(withoutConstructor) as Function;

      initialized2();

      expect(superSpies.test).toHaveBeenCalled();
    });

    it("calls class element with field's key if method is called", () => {
      const fieldElementSpy = jasmine.createSpy('field');

      const obj = {
        [result[1].key]: fieldElementSpy,
      };

      const probe1 = Symbol();
      const probe2 = Symbol();

      result[0].descriptor.value.call(obj, probe1, probe2);

      expect(fieldElementSpy).toHaveBeenCalledWith(probe1, probe2);
    });
  });
};

export default testLifecycleDescriptors;
