import CorpusculeElement from './index';

// tslint:disable:no-invalid-this
import {AttributeDescriptor, ComputedDescriptor, PropertyGuard, PropertyList, UpdateType} from './types';

export const initAttributes = (
  target: typeof CorpusculeElement,
  attributes: PropertyList<AttributeDescriptor>,
): ReadonlyArray<string> => {
  for (const [propertyName, [attributeName, guard]] of Object.entries(attributes)) {
    (target as any).__attributesRegistry.set(attributeName, [propertyName, guard]);

    Object.defineProperty(target.prototype, propertyName, {
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

  return Object.keys(attributes);
};

export const initProperties = (
  target: typeof CorpusculeElement,
  properties: PropertyList<PropertyGuard>,
): void => {
  for (const [propertyName, guard] of Object.entries(properties)) {
    Object.defineProperty(target.prototype, propertyName, {
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
    const cache = watchings.reduce<{[key: string]: any}>((acc, key) => {
      acc[key] = undefined;

      return acc;
    }, {});

    let value: any;
    let isValueUpdated = false;

    Object.defineProperty(prototype, propertyName, {
      get(this: any): any {
        for (const watching of watchings) {
          if (this[watching] !== cache[watching]) {
            if (!isValueUpdated) {
              value = get.call(this);
              isValueUpdated = true;
            }

            cache[watching] = this[watching];
          }
        }

        isValueUpdated = false;

        return value;
      },
    });
  }
};
