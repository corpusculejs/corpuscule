import assertKind from '../src/assertKind';

const testAssertKind = () => {
  describe('assertKind', () => {
    it('throws an error when expected and received kinds are different', () => {
      expect(() => {
        assertKind('foo', 'field', 'class');
      }).toThrow(new TypeError('@foo can be applied only to field, not to class'));
    });

    it('throws an error when "correct" is specified and false', () => {
      expect(() => {
        assertKind('foo', 'getter', 'method', false); // descriptor.get is undefined
      }).toThrow(new TypeError('@foo can be applied only to getter, not to method'));
    });

    it('doesn\'t throw an error when expected and received kinds are equal', () => {
      expect(() => {
        assertKind('foo', 'field', 'field');
      }).not.toThrow();
    });

    it('doesn\'t throw an error when "correct" is specified and true', () => {
      expect(() => {
        assertKind('foo', 'getter', 'method', true); // descriptor.get exists
      }).not.toThrow();
    });
  });
};

export default testAssertKind;
