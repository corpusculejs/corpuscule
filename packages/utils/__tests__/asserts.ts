import {assertKind, assertPlacement} from '../src/asserts';

const testAsserts = () => {
  describe('asserts', () => {
    describe('assertKind', () => {
      it('throws an error when expected and received kinds are different', () => {
        expect(() => {
          assertKind('foo', 'field', 'class');
        }).toThrow(new TypeError('@foo can be applied only to field, not to class'));
      });

      it('throws an error when "correct" is specified and false', () => {
        expect(() => {
          // E.g. descriptor.get is undefined
          assertKind('foo', 'getter', 'method', {correct: false});
        }).toThrow(new TypeError('@foo can be applied only to getter, not to method'));
      });

      it('doesn\'t throw an error when expected and received kinds are equal', () => {
        expect(() => {
          assertKind('foo', 'field', 'field');
        }).not.toThrow();
      });

      it('doesn\'t throw an error when "correct" is specified and true', () => {
        expect(() => {
          // E.g. descriptor.get exists
          assertKind('foo', 'getter', 'method', {correct: true});
        }).not.toThrow();
      });

      it('allows to set custom message for error', () => {
        expect(() => {
          assertKind('foo', 'field', 'method', {customMessage: 'test'});
        }).toThrow(new TypeError('test'));
      });
    });

    describe('assertPlacement', () => {
      it('throws an error when expected and received placements are different', () => {
        expect(() => {
          assertPlacement('foo', 'own', 'static');
        }).toThrow(new TypeError('@foo can be applied only to own class element, not to static'));
      });

      it('throws an error when "correct" is specified and false', () => {
        expect(() => {
          // E.g. placement can be own and static but received placement is prototype
          assertPlacement('foo', 'own or static', 'prototype', {correct: false});
        }).toThrow(new TypeError('@foo can be applied only to own or static class element, not to prototype'));
      });

      it('doesn\'t throw an error when expected and received kinds are equal', () => {
        expect(() => {
          assertPlacement('foo', 'own', 'own');
        }).not.toThrow();
      });

      it('doesn\'t throw an error when "correct" is specified and true', () => {
        expect(() => {
          assertPlacement('foo', 'own or static', 'static', {correct: true});
        }).not.toThrow();
      });

      it('allows to set custom message for error', () => {
        expect(() => {
          assertPlacement('foo', 'own', 'static', {customMessage: 'test'});
        }).toThrow(new TypeError('test'));
      });
    });
  });
};

export default testAsserts;
