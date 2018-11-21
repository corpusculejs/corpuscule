import {ExtendedPropertyDescriptor} from '@corpuscule/typings';
import {
  accessor,
  field,
  method,
} from '../src/descriptors';

const testDescriptors = () => {
  describe('descriptors', () => {
    const extras: ExtendedPropertyDescriptor[] = [];
    const finisher = () => {}; // tslint:disable-line:no-empty

    describe('field', () => {
      it('creates public field by default', () => {
        const initializer = () => 10;

        const result = field({
          extras,
          finisher,
          initializer,
          key: 'test',
        });

        expect(result).toEqual({
          descriptor: {
            configurable: true,
            enumerable: true,
            writable: true,
          },
          extras,
          finisher,
          initializer,
          key: 'test',
          kind: 'field',
          placement: 'own',
        });
      });

      it('creates private field', () => {
        const result = field({
          extras,
          finisher,
          initializer: () => 10,
          key: 'test',
        }, {isPrivate: true});

        expect(result.descriptor).toEqual({
          writable: true,
        });
      });

      it('creates readonly field', () => {
        const result = field({
          extras,
          finisher,
          initializer: () => 10,
          key: 'test',
        }, {isReadonly: true});

        expect(result.descriptor).toEqual({
          configurable: true,
          enumerable: true,
        });
      });

      it('creates static field', () => {
        const result = field({
          extras,
          finisher,
          initializer: () => 10,
          key: 'test',
        }, {isStatic: true});

        expect(result.placement).toBe('static');
      });

      it('creates initializer field', () => {
        const result = field({
          initializer: () => 10,
        });

        expect(result.key).toEqual(jasmine.any(Symbol));
      });
    });

    describe('method', () => {
      it('creates method descriptor by default', () => {
        const value = () => 10;

        const result = method({
          extras,
          finisher,
          key: 'test',
          value,
        });

        expect(result).toEqual({
          descriptor: {
            configurable: true,
            enumerable: true,
            value,
          },
          extras,
          finisher,
          key: 'test',
          kind: 'method',
          placement: 'prototype',
        });
      });

      it('creates bound method', () => {
        const result = method({
          extras,
          finisher,
          key: 'test',
          value(): unknown {
            return this.finisher; // tslint:disable-line:no-invalid-this
          },
        }, {isBound: true});

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

        const fn = result.initializer!() as () => unknown;
        expect(fn()).toBe(finisher);
      });

      it('creates private method', () => {
        const value = () => 10;

        const result = method({
          extras,
          finisher,
          key: 'test',
          value,
        }, {isPrivate: true});

        expect(result.descriptor).toEqual({
          value,
        });
      });

      it('creates static method', () => {
        const result = method({
          extras,
          finisher,
          key: 'test',
          value: () => 10,
        }, {isStatic: true});

        expect(result.placement).toBe('static');
      });
    });

    describe('accessor', () => {
      const get = () => {}; // tslint:disable-line:no-empty
      const set = () => {}; // tslint:disable-line:no-empty

      it('creates accessor by default', () => {
        const result = accessor({
          extras,
          finisher,
          get,
          key: 'test',
          set,
        });

        expect(result).toEqual({
          descriptor: {
            configurable: true,
            enumerable: true,
            get,
            set,
          },
          extras,
          finisher,
          key: 'test',
          kind: 'method',
          placement: 'prototype',
        });
      });

      it('creates private method', () => {
        const result = accessor({
          extras,
          finisher,
          get,
          key: 'test',
          set,
        }, {isPrivate: true});

        expect(result.descriptor).toEqual({
          get,
          set,
        });
      });

      it('creates static method', () => {
        const result = accessor({
          extras,
          finisher,
          get,
          key: 'test',
          set,
        }, {isStatic: true});

        expect(result.placement).toBe('static');
      });
    });
  });
};

export default testDescriptors;
