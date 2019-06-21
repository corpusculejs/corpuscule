import {setArray, setObject} from '../src/setters';

describe('@corpuscule/utils', () => {
  describe('setters', () => {
    describe('setArray', () => {
      it('creates an array for a registry by key if the key is not set yet', () => {
        const registry = new Map();
        setArray(registry, 'foo', ['bar']);

        expect(registry.get('foo')).toEqual(['bar']);
      });

      it('updates an array for a registry by key if the key is already set', () => {
        const registry = new Map();
        registry.set('foo', ['baz']);

        setArray(registry, 'foo', ['bar']);

        expect(registry.get('foo')).toEqual(['baz', 'bar']);
      });
    });

    describe('setObject', () => {
      it('creates an object for a registry by key if the key is not set yet', () => {
        const registry = new Map();
        setObject(registry, 'foo', {bar: 10});

        expect(registry.get('foo')).toEqual({bar: 10});
      });

      it('updates an object for a registry by key if the key is already set', () => {
        const registry = new Map();
        registry.set('foo', {baz: 20});

        setObject(registry, 'foo', {bar: 10});

        expect(registry.get('foo')).toEqual({bar: 10, baz: 20});
      });
    });
  });
});
