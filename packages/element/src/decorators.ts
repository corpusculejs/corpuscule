import {AttributeGuard, PropertyDescriptor, PropertyOptions} from './types';

export const element = (name: string) => (target: any): void => {
  target.is = name;
  customElements.define(name, target);
};

export const attribute =
  (name: string, guard: AttributeGuard, options?: PropertyOptions) =>
    ({constructor}: any, propertyName: string): void => {
      const value = options ? [name, guard, options] : [name, guard];

      if (!constructor._attributes) {
        constructor._attributes = {[propertyName]: value};
      } else {
        constructor._attributes[propertyName] = value;
      }
    };

export const property =
  (guard: PropertyDescriptor = null, options?: PropertyOptions) =>
    ({constructor}: any, propertyName: string): void => {
      const value = guard !== null && options
        ? [guard, options]
        : guard;

      if (!constructor._properties) {
        constructor._properties = {[propertyName]: value};
      } else {
        constructor._properties[propertyName] = value;
      }
    };

export const state = ({constructor}: any, propertyName: string): void => {
  if (!constructor._states) {
    constructor._states = [propertyName];
  } else {
    constructor._states.push(propertyName);
  }
};

export const computed =
  (...watchings: string[]) => // tslint:disable-line:readonly-array
    ({constructor}: any, propertyName: string): void => {
      if (!constructor._computed) {
        constructor._computed = {[propertyName]: watchings};
      } else {
        constructor._computed[propertyName] = watchings;
      }
    };
