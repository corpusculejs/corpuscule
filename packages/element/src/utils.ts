import CorpusculeElement from '.';

// tslint:disable:no-invalid-this
import {
  AttributeDescriptor,
  ComputedDescriptor,
  PropertyGuard,
  PropertyList,
  UpdateType
} from './types';

const {hasOwnProperty: has} = Object;

export const getBasePrototype = (
  target: typeof CorpusculeElement,
  property: '_attributes' | '_properties' | '_states' | '_computed',
): typeof CorpusculeElement | null => {
  let t: any | null = target;

  while (t !== null) {
    if (has.call(t, property)) {
      return t;
    }

    t = Object.getPrototypeOf(t);
  }

  return null;
};

export const initAttributes = (
  target: typeof CorpusculeElement,
  attributes: PropertyList<AttributeDescriptor>,
): ReadonlyArray<string> => {
  const {__attributesRegistry} = target as any;

  for (const [propertyName, [attributeName, guard]] of Object.entries(attributes)) {
    __attributesRegistry.set(attributeName, [propertyName, guard]);

    Object.defineProperty(target.prototype, propertyName, {
      configurable: true,
      get(this: any): any {
        return this.__properties[propertyName];
      },
      async set(this: any, value: any): Promise<void> {
        if (value === this.__properties[propertyName]) {
          return;
        }

        if (typeof value !== guard.name.toLowerCase()) {
          throw new TypeError(`Value applied to ${propertyName} is not ${guard.name}`);
        }

        this.__properties[propertyName] = value;

        if (guard === Boolean) {
          if (value) {
            this.setAttribute(attributeName, '');
          } else {
            this.removeAttribute(attributeName);
          }
        } else {
          this.setAttribute(attributeName, value);
        }

        await this.__invalidate(UpdateType.Props);
      },
    });
  }

  return Array.from(__attributesRegistry.keys());
};

export const initProperties = (
  target: typeof CorpusculeElement,
  properties: PropertyList<PropertyGuard>,
): void => {
  for (const [propertyName, guard] of Object.entries(properties)) {
    Object.defineProperty(target.prototype, propertyName, {
      configurable: true,
      get(this: any): any {
        return this.__properties[propertyName];
      },
      async set(this: any, value: any): Promise<void> {
        if (value === this.__properties[propertyName]) {
          return;
        }

        if (guard && !guard(value)) {
          throw new TypeError(`Value applied to ${propertyName} has wrong type`);
        }

        this.__properties[propertyName] = value;

        await this.__invalidate(UpdateType.Props);
      },
    });
  }
};

export const initStates = (
  {prototype}: typeof CorpusculeElement,
  states: ReadonlyArray<string>,
): void => {
  for (const propertyName of states) {
    Object.defineProperty(prototype, propertyName, {
      configurable: true,
      get(this: any): any {
        return this.__states[propertyName];
      },
      async set(this: any, value: any): Promise<void> {
        this.__states[propertyName] = value;
        await this.__invalidate(UpdateType.State);
      },
    });
  }
};

// tslint:disable:readonly-keyword
interface ComputedData {
  readonly cache: Map<string, any>;
  value: any;
} // tslint:enable:readonly-keyword

const prepareComputed = (
  instance: any,
  propertyName: string,
  // tslint:disable-next-line:readonly-keyword
  registry: WeakMap<any, Map<string, ComputedData>>,
  watchings: ReadonlyArray<string>,
  get: () => any,
) => {
  let map = registry.get(instance);

  if (!map) {
    map = new Map();
    registry.set(instance, map);
  }

  let computedData = map.get(propertyName);

  if (!computedData) {
    const value = get.call(instance);
    const cache = watchings.reduce<Map<string, any>>((acc, watchingProperty) => {
      acc.set(watchingProperty, instance[watchingProperty]);

      return acc;
    }, new Map());

    computedData = {
      cache,
      value,
    };

    map.set(propertyName, computedData);
  }

  return computedData;
};

export const initComputed = (
  {prototype}: typeof CorpusculeElement,
  computed: PropertyList<ComputedDescriptor>,
): void => {
  for (const [propertyName, watchings] of Object.entries(computed)) {
    const descriptor = Object.getOwnPropertyDescriptor(prototype, propertyName);

    if (!descriptor || !descriptor.get) {
      throw new Error(`Property ${propertyName} is not defined or is not a getter`);
    }

    const {get} = descriptor;

    const registry = new WeakMap();

    Object.defineProperty(prototype, propertyName, {
      configurable: true,
      get(this: any): any {
        const computedData = prepareComputed(
          this,
          propertyName,
          registry,
          watchings,
          get,
        );

        const {cache} = computedData;
        let isValueUpdated = false;

        for (const [watchingProperty, watchingValue] of cache) {
          if (this[watchingProperty] !== watchingValue) {
            if (!isValueUpdated) {
              computedData.value = get.call(this);
              isValueUpdated = true;
            }

            cache.set(watchingProperty, this[watchingProperty]);
          }
        }

        isValueUpdated = false;

        return computedData.value;
      },
    });
  }
};
