import {AttributeGuard, PropertyGuard} from './types';

export const CustomElement = (name: string) => (target: any) => {
  Object.defineProperty(target, 'is', {
    value: name,
  });

  // tslint:disable-next-line:no-floating-promises
  Promise.resolve().then(() => customElements.define(name, target));
};

export const Attribute = (name: string, guard: AttributeGuard) => ({constructor}: any, propertyName: string) => {
  constructor._attributes[propertyName] = [name, guard];
};

export const Property = (guard: PropertyGuard = null) => ({constructor}: any, propertyName: string) => {
  constructor._properties[propertyName] = guard;
};

export const State = ({constructor}: any, propertyName: string) => {
  constructor._states.push(propertyName);
};

// tslint:disable-next-line:readonly-array
export const Computed = (...watchings: string[]) => ({constructor}: any, propertyName: string) => {
  constructor._computed[propertyName] = watchings;
};
