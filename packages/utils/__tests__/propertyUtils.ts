import {getName} from '../src/propertyUtils';

describe('@corpuscule/utils', () => {
  describe('propertyUtils', () => {
    describe('getName', () => {
      it('gets property itself if it is a string or number', () => {
        expect(getName('foo')).toBe('foo');
        expect(getName(1)).toBe(1);
      });

      it('gets description if property is a symbol', () => {
        expect(getName(Symbol('bar'))).toBe('bar');
      });
    });
  });
});
