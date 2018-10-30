// tslint:disable:max-classes-per-file no-unnecessary-class

import addToRegistry from '../src/addToRegistry';

const addToRegistryTest = () => {
  describe('addToRegistry', () => {
    class Test {}

    let registry: WeakMap<any, Map<string, string>>;

    beforeEach(() => {
      registry = new WeakMap();
    });

    it('should create a new global record in registry if it still does not have it', () => {
      expect(registry.has(Test)).not.toBeTruthy();

      addToRegistry(registry, Test, 'key', 'value');

      expect(registry.has(Test)).toBeTruthy();
      expect(registry.get(Test)).toEqual(new Map([['key', 'value']]));
    });

    it('should add local record to a global record if global one already exists', () => {
      registry.set(Test, new Map([['foo', 'bar']]));

      expect(registry.has(Test));

      addToRegistry(registry, Test, 'key', 'value');

      expect(registry.get(Test)).toEqual(new Map([['foo', 'bar'], ['key', 'value']]));
    });
  });
};

export default addToRegistryTest;
