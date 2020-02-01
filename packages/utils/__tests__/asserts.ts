// tslint:disable:no-bitwise
import {assertRequiredProperty} from '../src/asserts';

describe('@corpuscule/utils', () => {
  describe('asserts', () => {
    describe('assertRequiredProperty', () => {
      it('throws an error if property is undefined or null', () => {
        expect(() =>
          assertRequiredProperty('foo', 'bar', 'test', undefined),
        ).toThrowError('@foo requires test property marked with @bar');
      });

      it("doesn't throw an error if property is different than undefined", () => {
        expect(() =>
          assertRequiredProperty('foo', 'bar', 'test', null),
        ).not.toThrow();
      });

      it('allows to omit property name', () => {
        expect(() =>
          assertRequiredProperty('foo', 'bar', undefined),
        ).toThrowError('@foo requires any property marked with @bar');
      });
    });
  });
});
