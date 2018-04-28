// tslint:disable:no-invalid-this
import {AttributeConverter, InvalidationType} from './types';

export type AttributeData = [string, AttributeConverter | undefined];

// tslint:disable-next-line:readonly-array
export const attributeMap = new WeakMap<any, Map<string, AttributeData>>();

export const Attribute =
  (
    attributeName: string,
    convert?: AttributeConverter,
    pure: boolean = true,
  ) => (prototype: any, propertyName: string): any => {
    const attributes = attributeMap.get(prototype);
    const data: AttributeData = [propertyName, convert];

    if (!attributes) {
      attributeMap.set(prototype, new Map([[attributeName, data]]));
    } else {
      attributes.set(attributeName, data);
    }

    return {
      get(this: any): any {
        return this.__props[propertyName];
      },
      async set(this: any, value: any): Promise<void> {
        if (pure && value === this.__props[propertyName]) {
          return;
        }

        this.__props[propertyName] = value;

        if (typeof value === 'boolean') {
          if (value) {
            this.setAttribute(attributeName, '');
          } else {
            this.removeAttribute(attributeName);
          }
        } else {
          this.setAttribute(attributeName, value);
        }

        await this._invalidate(InvalidationType.Props);
      },
    };
  };

export const Property = (pure: boolean = true) => (_prototype: any, propertyName: string): any => ({
  get(this: any): any {
    return this.__props[propertyName];
  },
  async set(this: any, value: any): Promise<void> {
    if (pure && value === this.__props[propertyName]) {
      return;
    }

    this.__props[propertyName] = value;
    await this._invalidate(InvalidationType.Props);
  },
});

export const State = (_prototype: any, propertyName: string): any => ({
  get(this: any): any {
    return this.__state[propertyName];
  },
  async set(this: any, value: any): Promise<void> {
    this.__state[propertyName] = value;
    await this._invalidate(InvalidationType.State);
  },
});

// tslint:disable-next-line:readonly-array
export const Computed = (...watchings: string[]) =>
  (_prototype: any, _propertyName: string, {get}: TypedPropertyDescriptor<any>): any => {
    if (!get) {
      throw new Error('computed() can be applied only to getters');
    }

    let value: any;
    const watchingsMap = watchings.reduce<{[key: string]: any}>((acc, key) => {
      acc[key] = undefined;

      return acc;
    }, {});

    return {
      get(this: any): any {
        for (const watching of watchings) {
          if (this[watching] !== watchingsMap[watching]) {
            value = get.call(this);
            break;
          }
        }

        return value;
      },
    };
  };

export const CustomElement = (name: string) => (target: any): any => {
  Object.defineProperty(target, 'is', {
    value: name,
  });

  const attributes = attributeMap.get(target.prototype);

  if (attributes) {
    Object.defineProperty(target, 'observedAttributes', {
      value: Array.from(attributes.keys()),
    });
  }

  // tslint:disable-next-line:no-floating-promises
  Promise.resolve().then(() => {
    customElements.define(name, target);
  });

  return target;
};
