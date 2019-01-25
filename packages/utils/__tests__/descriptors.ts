import {ExtendedPropertyDescriptor} from '@corpuscule/typings';
import * as $ from '../src/descriptors';

const testDescriptors = () => {
  describe('descriptors', () => {
    const extras: ExtendedPropertyDescriptor[] = [];
    const finisher = () => {}; // tslint:disable-line:no-empty

    describe('field', () => {
      it('creates default public field', () => {
        const initializer = () => 10;

        const result = $.field({
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

      it('allows to change default descriptor', () => {
        const result = $.field({
          configurable: false,
          enumerable: false,
          extras,
          finisher,
          initializer: () => 10,
          key: 'test',
          writable: false,
        });

        expect(result.descriptor).toEqual({
          configurable: false,
          enumerable: false,
          writable: false,
        });
      });

      it('allows to change default placement', () => {
        const result = $.field({
          extras,
          finisher,
          initializer: () => 10,
          key: 'test',
          placement: 'static',
        });

        expect(result.placement).toBe('static');
      });

      it('allows field for initialization only', () => {
        const result = $.field({
          initializer: () => 10,
        });

        expect(result.key).toEqual(jasmine.any(Symbol));
      });
    });

    describe('method', () => {
      it('creates default method descriptor', () => {
        const method = () => 10;

        const result = $.method({
          extras,
          finisher,
          key: 'test',
          method,
        });

        expect(result).toEqual({
          descriptor: {
            configurable: true,
            enumerable: true,
            value: method,
            writable: true,
          },
          extras,
          finisher,
          key: 'test',
          kind: 'method',
          placement: 'prototype',
        });
      });

      it('allows binding context to method', () => {
        const result = $.method({
          bound: true,
          extras,
          finisher,
          key: 'test',
          method(): unknown {
            return this.finisher; // tslint:disable-line:no-invalid-this
          },
        });

        expect(result).toEqual({
          descriptor: {
            configurable: true,
            enumerable: true,
            writable: true,
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

      it('allows to change default placement', () => {
        const result = $.method({
          extras,
          finisher,
          key: 'test',
          method: () => 10,
          placement: 'static',
        });

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

      it('creates default accessor', () => {
        const result = $.accessor({
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

      it('allows to change default placement', () => {
        const result = $.accessor({
          extras,
          finisher,
          get,
          key: 'test',
          placement: 'static',
          set,
        });

        expect(result.placement).toBe('static');
      });

      it('creates accessor with field if original element has initializer', () => {
        const initializer = () => 10;

        const result = $.accessor({
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
          extras: [
            {
              descriptor: {
                configurable: true,
                enumerable: false,
                writable: true,
              },
              initializer,
              key: jasmine.any(Symbol),
              kind: 'field',
              placement: 'own',
            } as any,
          ],
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

      it('allows to adjust internally created set and get', () => {
        const adjustedGetSpy = jasmine.createSpy('adjustedGet');
        const adjustedSetSpy = jasmine.createSpy('adjustedSet');

        const result = $.accessor({
          adjust({get: originalGet, set: originalSet}: $.AccessorMethods): $.AccessorMethods {
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
          get,
          key: 'test',
          set,
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
