import CorpusculeElement, {ComputedDescriptorMap, PropertyDescriptorMap} from '.';

// tslint:disable:no-invalid-this
import {
  AttributeGuard,
  PropertyGuard,
  PropertyOptions,
  UpdateType
} from './types';

const {hasOwnProperty: has} = Object;

export const getAllPropertyDescriptors = (
  target: typeof CorpusculeElement,
  getter: '_attributes' | '_properties' | '_states' | '_computed',
): any => {
  const isArray = getter === '_states';
  let descriptors  = isArray ? [] : {};
  let t: any  = target;

  while (t !== HTMLElement) {
    if (has.call(t, getter)) {
      descriptors = isArray ? [
        ...descriptors as any[],
        ...target[getter]! as any[],
      ] : {
        ...descriptors,
        ...target[getter]!,
      };
    }

    t = Object.getPrototypeOf(t);
  }

  return descriptors;
};

export const toAttribute = (
  instance: CorpusculeElement,
  attributeName: string,
  value: boolean | number | string,
): void => {
  if (typeof value === 'boolean') {
    if (value) {
      instance.setAttribute(attributeName, '');
    } else {
      instance.removeAttribute(attributeName);
    }
  } else {
    instance.setAttribute(attributeName, value.toString());
  }
};

type CommonAttributeDescriptor = [string, AttributeGuard, PropertyOptions | undefined];

const defaultPropertyOptions: Required<PropertyOptions> = {pure: true};

export const initAttributes = (
  target: typeof CorpusculeElement,
  attributes: {readonly [propertyName: string]: CommonAttributeDescriptor},
): ReadonlyArray<string> => {
  const attributesRegistry = new Map();

  for (const [
    propertyName,
    [attributeName, guard, {pure} = defaultPropertyOptions],
  ] of Object.entries(attributes)) {
    attributesRegistry.set(attributeName, [propertyName, guard]);

    Object.defineProperty(target.prototype, propertyName, {
      configurable: true,
      get(this: any): any {
        return this.__properties[propertyName];
      },
      set(this: any, value: any): void {
        if (pure && value === this.__properties[propertyName]) {
          return;
        }

        if (typeof value !== guard.name.toLowerCase()) {
          throw new TypeError(`Value applied to ${this.constructor.name}.${propertyName} is not ${guard.name}`);
        }

        this.__properties[propertyName] = value;

        if (this.__isMount) {
          toAttribute(this, attributeName, value);
        }

        this.__invalidate(UpdateType.Props);
      },
    });
  }

  (target as any).__attributesRegistry = attributesRegistry;

  Object.defineProperty(target, '__attributesRegistry', {
    value: attributesRegistry,
  });

  return Array.from(attributesRegistry.keys());
};

export const initProperties = (
  target: typeof CorpusculeElement,
  properties: PropertyDescriptorMap<any>,
): void => {
  for (const [propertyName, descriptor] of Object.entries(properties)) {
    let guard: PropertyGuard | null = null;
    let pure = true;

    if (descriptor !== null) {
      if (typeof descriptor === 'function') {
        guard = descriptor;
      } else {
        [guard, {pure = defaultPropertyOptions.pure}] = descriptor;
      }
    }

    Object.defineProperty(target.prototype, propertyName, {
      configurable: true,
      get(this: any): any {
        return this.__properties[propertyName];
      },
      set(this: any, value: any): void {
        if (pure && value === this.__properties[propertyName]) {
          return;
        }

        if (guard && !guard(value)) {
          throw new TypeError(`Value applied to ${this.constructor.name}.${propertyName} has wrong type`);
        }

        this.__properties[propertyName] = value;

        this.__invalidate(UpdateType.Props);
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
      set(this: any, value: any): void {
        this.__states[propertyName] = value;
        this.__invalidate(UpdateType.State);
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
  computed: ComputedDescriptorMap<any>,
): void => {
  for (const [propertyName, watchings] of Object.entries(computed)) {
    const descriptor = Object.getOwnPropertyDescriptor(prototype, propertyName);

    if (!descriptor || !descriptor.get) {
      throw new Error(`Property ${prototype.constructor.name}.${propertyName} is not defined or is not a getter`);
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
