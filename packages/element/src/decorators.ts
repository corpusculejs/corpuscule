import {AttributeGuard, PropertyGuard} from './types';

export const element = (name: string) => (target: any): void => {
  Object.defineProperty(target, 'is', {
    value: name,
  });

  customElements.define(name, target);
};

export const attribute = (name: string, guard: AttributeGuard) => ({constructor}: any, propertyName: string): void => {
  const value = [name, guard];

  if (!constructor._attributes) {
    constructor._attributes = {[propertyName]: value};
  } else {
    constructor._attributes[propertyName] = value;
  }
};

export const property = (guard: PropertyGuard = null) => ({constructor}: any, propertyName: string): void => {
  if (!constructor._properties) {
    constructor._properties = {[propertyName]: guard};
  } else {
    constructor._properties[propertyName] = guard;
  }
};

export const state = ({constructor}: any, propertyName: string): void => {
  if (!constructor._states) {
    constructor._states = [propertyName];
  } else {
    constructor._states.push(propertyName);
  }
};

// tslint:disable-next-line:readonly-array
export const computed = (...watchings: string[]) => ({constructor}: any, propertyName: string): void => {
  if (!constructor._computed) {
    constructor._computed = {[propertyName]: watchings};
  } else {
    constructor._computed[propertyName] = watchings;
  }
};
