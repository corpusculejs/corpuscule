import {ExtendedPropertyDescriptor} from '@corpuscule/typings';
import {
  accessor,
  boundMethod,
  method,
  privateField, privateMethod,
  readonlyField,
  toStatic,
} from '../src/descriptors';

const testDescriptors = () => {
  describe('descriptors', () => {
    const extras: ExtendedPropertyDescriptor[] = [];
    const finisher = () => {}; // tslint:disable-line:no-empty

    describe('methods', () => {
      it('"method" creates method descriptor', () => {
        const testValue = 10;
        const result = method({
          extras,
          finisher,
          key: 'test',
          value(): number {
            return testValue;
          },
        });

        expect(result).toEqual({
          descriptor: {
            configurable: true,
            enumerable: true,
            value: jasmine.any(Function),
          },
          extras,
          finisher,
          key: 'test',
          kind: 'method',
          placement: 'prototype',
        });

        expect(result.descriptor.value()).toBe(10);
      });

      it('"accessor" creates accessor descriptor', () => {
        let testValue = 10;
        const result = accessor({
          extras,
          finisher,
          key: 'test',
          get(): number {
            return testValue;
          },
          set(v: number): void {
            testValue = v;
          },
        });

        expect(result).toEqual({
          descriptor: {
            configurable: true,
            enumerable: true,
            get: jasmine.any(Function),
            set: jasmine.any(Function),
          },
          extras,
          finisher,
          key: 'test',
          kind: 'method',
          placement: 'prototype',
        });

        expect(result.descriptor.get!()).toBe(10);
        result.descriptor.set!(20);
        expect(testValue).toBe(20);
      });

      it('"privateMethod" creates method descriptor', () => {
        const testValue = 10;
        const result = privateMethod({
          extras,
          finisher,
          key: 'test',
          value(): number {
            return testValue;
          },
        });

        expect(result).toEqual({
          descriptor: {
            value: jasmine.any(Function),
          },
          extras,
          finisher,
          key: 'test',
          kind: 'method',
          placement: 'prototype',
        });

        expect(result.descriptor.value()).toBe(10);
      });
    });

    describe('fields', () => {
      it('"readonlyField" creates readonly field descriptor', () => {
        const testValue = 10;

        const result = readonlyField({
          extras,
          finisher,
          key: 'test',
          initializer(): number {
            return testValue;
          },
        });

        expect(result).toEqual({
          descriptor: {
            configurable: true,
            enumerable: true,
          },
          extras,
          finisher,
          initializer: jasmine.any(Function),
          key: 'test',
          kind: 'field',
          placement: 'own',
        });

        expect(result.initializer!()).toBe(10);
      });

      it('"privateField" creates field descriptor', () => {
        const testValue = 10;

        const result = privateField({
          extras,
          finisher,
          key: 'test',
          initializer(): number {
            return testValue;
          },
        });

        expect(result).toEqual({
          descriptor: {
            writable: true,
          },
          extras,
          finisher,
          initializer: jasmine.any(Function),
          key: 'test',
          kind: 'field',
          placement: 'own',
        });

        expect(result.initializer!()).toBe(10);
      });

      it('"boundMethod" creates bound method descriptor', () => {
        const result = boundMethod({
          extras,
          finisher,
          key: 'test',
          initializer(): () => unknown {
            return () => this.finisher; // tslint:disable-line:no-invalid-this
          },
        });

        expect(result).toEqual({
          descriptor: {},
          extras,
          finisher,
          initializer: jasmine.any(Function),
          key: 'test',
          kind: 'field',
          placement: 'own',
        });

        const bound = result.initializer!() as () => unknown;
        expect(bound()).toBe(finisher);
      });
    });

    it('"toStatic" converts any extended property descriptor to a static one', () => {
      expect(toStatic({
        descriptor: {},
        key: 'test',
        kind: 'field',
        placement: 'own',
      })).toEqual({
        descriptor: {},
        key: 'test',
        kind: 'field',
        placement: 'static',
      });
    });
  });
};

export default testDescriptors;
