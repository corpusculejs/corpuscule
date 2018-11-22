import {ExtendedPropertyDescriptor} from '@corpuscule/typings';
import {
  accessor, AccessorMethods,
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
      let get: jasmine.Spy;
      let set: jasmine.Spy;

      beforeEach(() => {
        get = jasmine.createSpy('get');
        set = jasmine.createSpy('set');
      });

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

      it('creates accessor with field if original element has initializer', () => {
        const initializer = () => 10;

        const result = accessor({
          extras,
          finisher,
          initializer,
          key: 'test',
        });

        expect(result).toEqual({
          descriptor: {
            configurable: true,
            enumerable: true,
            get: jasmine.any(Function),
            set: jasmine.any(Function),
          },
          extras: [{
            descriptor: {
              writable: true,
            },
            extras: undefined,
            finisher: undefined,
            initializer,
            key: jasmine.any(Symbol),
            kind: 'field',
            placement: 'own',
          } as any],
          finisher,
          key: 'test',
          kind: 'method',
          placement: 'prototype',
        });

        const [{key}] = result.extras!;

        const testObj = {
          [key]: 20,
        };

        expect(result.descriptor.get!.call(testObj)).toBe(20);
        result.descriptor.set!.call(testObj, 30);
        expect(testObj[key as string]).toBe(30);
      });

      it('allows to create accessor with field and get them in array instead of extra', () => {
        const initializer = () => 10;

        const result = accessor({
          initializer,
          key: 'test',
        }, {toArray: true});

        expect(result).toEqual([
          {
            descriptor: {
              configurable: true,
              enumerable: true,
              get: jasmine.any(Function),
              set: jasmine.any(Function),
            },
            extras: undefined,
            finisher: undefined,
            key: 'test',
            kind: 'method',
            placement: 'prototype',
          },
          {
            descriptor: {
              writable: true,
            },
            extras: undefined,
            finisher: undefined,
            initializer,
            key: jasmine.any(Symbol),
            kind: 'field',
            placement: 'own',
          } as any,
        ]);
      });

      it('allows to adjust internally created set and get', () => {
        const adjustedGetSpy = jasmine.createSpy('adjustedGet');
        const adjustedSetSpy = jasmine.createSpy('adjustedSet');

        const result = accessor({
          get,
          key: 'test',
          set,
        }, {
          adjust({get: originalGet, set: originalSet}: AccessorMethods): AccessorMethods {
            return {
              get(): unknown {
                adjustedGetSpy();

                return originalGet();
              },
              set(v: unknown): void {
                adjustedSetSpy(v);
                originalSet(v);
              },
            };
          },
        });

        result.descriptor.get!();
        expect(get).toHaveBeenCalledTimes(1);
        expect(adjustedGetSpy).toHaveBeenCalledTimes(1);

        result.descriptor.set!(100);

        expect(set).toHaveBeenCalledWith(100);
        expect(adjustedSetSpy).toHaveBeenCalledWith(100);
      });
    });
  });
};

export default testDescriptors;
