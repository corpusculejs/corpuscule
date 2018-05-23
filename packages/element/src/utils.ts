import CorpusculeElement, {ComputedDescriptorMap, PropertyDescriptorMap} from '.';
import * as $$ from './tokens/internal';
import * as $ from './tokens/lifecycle';

// tslint:disable:no-invalid-this
import {
  AttributeGuard,
  PropertyGuard,
  PropertyOptions,
  UpdateType
} from './types';

const {hasOwnProperty: has} = Object;
const handleError = (e: Error) => {
  throw e;
};

export const getAllPropertyDescriptors = (
  target: typeof CorpusculeElement,
  getter:
    | typeof $.attributeMap
    | typeof $.propertyMap
    | typeof $.computedMap
    | typeof $.stateMap,
): any => {
  const isArray = getter === $.stateMap;
  let descriptors  = isArray ? [] : {};
  let t: any = target;

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
        return this[$$.properties][propertyName];
      },
      set(this: any, value: any): void {
        const {[$$.properties]: props} = this;

        if (pure && value === props[propertyName]) {
          return;
        }

        if (typeof value !== guard.name.toLowerCase()) {
          throw new TypeError(`Value applied to "${propertyName}" is not ${guard.name}`);
        }

        props[propertyName] = value;

        if (this[$$.isMount]) {
          toAttribute(this, attributeName, value);
        }

        this[$$.invalidate](UpdateType.Props).catch(handleError);
      },
    });
  }

  (target as any)[$$.attributesRegistry] = attributesRegistry;

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
        return this[$$.properties][propertyName];
      },
      set(this: any, value: any): void {
        const {[$$.properties]: props} = this;

        if (pure && value === props[propertyName]) {
          return;
        }

        if (guard && !guard(value)) {
          throw new TypeError(`Value applied to "${propertyName}" has wrong type`);
        }

        props[propertyName] = value;

        this[$$.invalidate](UpdateType.Props).catch(handleError);
      },
    });
  }
};

export const initStates = (
  {prototype}: typeof CorpusculeElement,
  states: ReadonlyArray<string | symbol>,
): void => {
  for (const propertyName of states) {
    Object.defineProperty(prototype, propertyName, {
      configurable: true,
      get(this: any): any {
        return this[$$.states][propertyName];
      },
      set(this: any, value: any): void {
        this[$$.states][propertyName] = value;
        this[$$.invalidate](UpdateType.State).catch(handleError);
      },
    });
  }
};

// tslint:disable:readonly-keyword
interface ComputedData {
  readonly cache: Map<string | symbol, any>;
  value: any;
} // tslint:enable:readonly-keyword

const prepareComputed = (
  instance: any,
  propertyName: string | symbol,
  // tslint:disable-next-line:readonly-keyword
  registry: WeakMap<any, Map<string | symbol, ComputedData>>,
  watchings: ReadonlyArray<string | symbol>,
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
    const cache = watchings.reduce<Map<string | symbol, any>>((acc, watchingProperty) => {
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

const getPropertyDescriptor = <T>(prototype: T, propertyName: string): PropertyDescriptor | undefined => {
  let p: any = prototype;

  while (p.constructor !== HTMLElement) {
    const descriptor = Object.getOwnPropertyDescriptor(p, propertyName);

    if (descriptor) {
      return descriptor;
    }

    p = Object.getPrototypeOf(p);
  }

  return undefined;
};

export const initComputed = (
  target: typeof CorpusculeElement,
  computed: ComputedDescriptorMap<any>,
): void => {
  for (const [propertyName, watchings] of Object.entries(computed)) {
    const descriptor = getPropertyDescriptor(target.prototype, propertyName);

    if (!descriptor || !descriptor.get) {
      throw new Error(`Property "${propertyName}" is not defined or is not a getter`);
    }

    const {get} = descriptor;

    const registry = new WeakMap();

    Object.defineProperty(target.prototype, propertyName, {
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
