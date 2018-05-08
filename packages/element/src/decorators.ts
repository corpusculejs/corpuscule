import {AttributeGuard, PropertyGuard} from './types';

export const element = (name: string) => (target: any): void => {
  Object.defineProperty(target, 'is', {
    value: name,
  });

  customElements.define(name, target);
};

export const attribute = (name: string, guard: AttributeGuard) => ({constructor}: any, propertyName: string): void => {
  constructor._attributes[propertyName] = [name, guard];
};

export const property = (guard: PropertyGuard = null) => ({constructor}: any, propertyName: string): void => {
  constructor._properties[propertyName] = guard;
};

export const state = ({constructor}: any, propertyName: string): void => {
  constructor._states.push(propertyName);
};

// tslint:disable-next-line:readonly-array
export const computed = (...watchings: string[]) => ({constructor}: any, propertyName: string): void => {
  constructor._computed[propertyName] = watchings;
};
