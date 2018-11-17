// tslint:disable:no-unbound-method

import {ExtendedPropertyDescriptor} from '@corpuscule/typings';
import createDualDescriptor from '../src/createDualDescriptor';

const testCreateDualDescriptor = () => {
  describe('createDualDescriptor', () => {
    it('gets existing descriptor if element is accessor', () => {
      const getSpy = jasmine.createSpy('accessorGet');
      const setSpy = jasmine.createSpy('accessorset');

      const accessor: ExtendedPropertyDescriptor = {
        descriptor: {
          get: getSpy,
          set: setSpy,
        },
        key: 'test',
        kind: 'method',
        placement: 'prototype',
      };

      const [descriptor] = createDualDescriptor(accessor.descriptor, accessor.initializer);

      expect(descriptor).toBe(accessor.descriptor);
    });

    it('gets accessor descriptor with storage property descriptor if element is a field', () => {
      const field: ExtendedPropertyDescriptor = {
        descriptor: {},
        initializer: () => false,
        key: 'test',
        kind: 'field',
        placement: 'own',
      };

      const [descriptor, initializerDescriptor] = createDualDescriptor(field.descriptor, field.initializer);

      expect(descriptor).toEqual({
        get: jasmine.any(Function),
        set: jasmine.any(Function),
      });

      expect(initializerDescriptor).toEqual({
        descriptor: jasmine.any(Object),
        extras: undefined,
        finisher: undefined,
        initializer: field.initializer,
        key: jasmine.any(Symbol),
        kind: 'field',
        placement: 'own',
      } as any);

      const testThis = {
        [initializerDescriptor!.key]: 20,
      };

      expect(descriptor.get!.call(testThis)).toBe(20);

      descriptor.set!.call(testThis, 40);

      expect(testThis[initializerDescriptor!.key as string]).toBe(40);
    });
  });
};

export default testCreateDualDescriptor;
