import {attributeMap, computedMap, propertyMap, stateMap} from ".";

export const element = name => (target) => {
  target.is = name;
  customElements.define(name, target);
};

export const attribute = (name, guard, options) => ({constructor}, propertyKey) => {
  const value = options ? [name, guard, options] : [name, guard];

  if (constructor[attributeMap]) {
    constructor[attributeMap][propertyKey] = value;
  } else {
    constructor[attributeMap] = {[propertyKey]: value};
  }
};

export const property = (guard = null, options) => ({constructor}, propertyKey) => {
  const value = guard !== null && options
    ? [guard, options]
    : guard;

  if (constructor[propertyMap]) {
    constructor[propertyMap][propertyKey] = value;
  } else {
    constructor[propertyMap] = {[propertyKey]: value};
  }
};

export const state = ({constructor}, propertyKey) => {
  if (constructor[stateMap]) {
    constructor[stateMap].push(propertyKey);
  } else {
    constructor[stateMap] = [propertyKey];
  }
};

export const computed = (...watchings) => ({constructor}, propertyKey) => {
  if (constructor[computedMap]) {
    constructor[computedMap][propertyKey] = watchings;
  } else {
    constructor[computedMap] = {[propertyKey]: watchings};
  }
};
