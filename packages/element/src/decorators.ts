import {attributeMap, computedMap, propertyMap, stateMap} from '.';
import {AttributeGuard, PropertyDescriptor, PropertyOptions} from './types';

export const element = (name: string) => (target: any): void => {
  target.is = name;
  customElements.define(name, target);
};

export const attribute =
  (name: string, guard: AttributeGuard, options?: PropertyOptions) =>
    ({constructor}: any, propertyName: string | symbol): void => {
      const value = options ? [name, guard, options] : [name, guard];

      if (!constructor[attributeMap]) {
        constructor[attributeMap] = {[propertyName]: value};
      } else {
        constructor[attributeMap][propertyName] = value;
      }
    };

export const property =
  (guard: PropertyDescriptor = null, options?: PropertyOptions) =>
    ({constructor}: any, propertyName: string | symbol): void => {
      const value = guard !== null && options
        ? [guard, options]
        : guard;

      if (!constructor[propertyMap]) {
        constructor[propertyMap] = {[propertyName]: value};
      } else {
        constructor[propertyMap][propertyName] = value;
      }
    };

export const state = ({constructor}: any, propertyName: string | symbol): void => {
  if (!constructor[stateMap]) {
    constructor[stateMap] = [propertyName];
  } else {
    constructor[stateMap].push(propertyName);
  }
};

export const computed =
  (...watchings: Array<string | symbol>) => // tslint:disable-line:readonly-array
    ({constructor}: any, propertyName: string | symbol): void => {
      if (!constructor[computedMap]) {
        constructor[computedMap] = {[propertyName]: watchings};
      } else {
        constructor[computedMap][propertyName] = watchings;
      }
    };
