// tslint:disable:no-bitwise
import {
  assertKind,
  assertPlacement,
  assertRequiredProperty,
  Kinds,
  Placements,
} from '../src/asserts';

const testAsserts = () => {
  describe('asserts', () => {
    describe('assertKind', () => {
      it('throws an error if descriptor kind is not specified in allowed', () => {
        expect(() =>
          assertKind('foo', Kinds.Field | Kinds.Accessor, {
            descriptor: {
              value(): null {
                return null;
              },
            },
            key: 'test',
            kind: 'method',
            placement: 'prototype',
          }),
        ).toThrow(new TypeError('@foo cannot be applied to test: it is not accessor or field'));
      });

      it('does not throw an error if descriptor kind is specified in allowed', () => {
        expect(() =>
          assertKind('foo', Kinds.Field | Kinds.Method, {
            descriptor: {
              value(): null {
                return null;
              },
            },
            key: 'test',
            kind: 'method',
            placement: 'prototype',
          }),
        ).not.toThrow();
      });
    });

    describe('assertPlacement', () => {
      it('throws an error if descriptor placement is not specified in allowed', () => {
        expect(() =>
          assertPlacement('foo', Placements.Own, {
            descriptor: {},
            key: 'test',
            kind: 'method',
            placement: 'prototype',
          }),
        ).toThrow(new TypeError('@foo cannot be applied to test: it is not own class element'));
      });

      it('does not throw an error if descriptor placement is specified in allowed', () => {
        expect(() =>
          assertPlacement('foo', Placements.Own | Placements.Prototype, {
            descriptor: {},
            key: 'test',
            kind: 'method',
            placement: 'prototype',
          }),
        ).not.toThrow();
      });
    });

    describe('assertRequiredProperty', () => {
      it('throws an error if property is undefined or null', () => {
        expect(() => assertRequiredProperty('foo', 'bar', 'test', undefined)).toThrowError(
          '@foo requires test property marked with @bar',
        );
      });

      it("doesn't throw an error if property is different than undefined", () => {
        expect(() => assertRequiredProperty('foo', 'bar', 'test', null)).not.toThrow();
      });

      it('allows to omit property name', () => {
        expect(() => assertRequiredProperty('foo', 'bar', undefined)).toThrowError(
          '@foo requires any property marked with @bar',
        );
      });
    });
  });
};

export default testAsserts;
