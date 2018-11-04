// tslint:disable:max-classes-per-file no-unnecessary-class

import addToRegistry from '../src/addToRegistry';

const testAddToRegistry = () => {
  describe('addToRegistry', () => {
    class Test {}

    describe('Map', () => {
      let registry: WeakMap<any, Map<string, string>>;

      beforeEach(() => {
        registry = new WeakMap();
      });

      it('creates a new global record in registry', () => {
        addToRegistry(registry, Test, 'key', 'value');
        expect(registry.get(Test)).toEqual(new Map([['key', 'value']]));
      });

      it('adds local record to a global record', () => {
        registry.set(Test, new Map([['foo', 'bar']]));

        addToRegistry(registry, Test, 'key', 'value');
        expect(registry.get(Test)).toEqual(new Map([['foo', 'bar'], ['key', 'value']]));
      });
    });

    describe('Array', () => {
      let registry: WeakMap<any, string[]>;

      beforeEach(() => {
        registry = new WeakMap();
      });

      it('creates a new global record in registry', () => {
        addToRegistry(registry, Test, 'value');
        expect(registry.get(Test)).toEqual(['value']);
      });

      it('adds local record to a global record', () => {
        registry.set(Test, ['foo']);

        addToRegistry(registry, Test, 'value');
        expect(registry.get(Test)).toEqual(['foo', 'value']);
      });
    });
  });
};

export default testAddToRegistry;
