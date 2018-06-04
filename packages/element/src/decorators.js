import {attributeMap, computedMap, propertyMap, stateMap} from ".";

export const element = name => (target) => {
  target.is = name;
  customElements.define(name, target);
};

export const attribute = (name, guard, options) => ({constructor}, propertyName) => {
  const value = options ? [name, guard, options] : [name, guard];

  if (constructor[attributeMap]) {
    constructor[attributeMap][propertyName] = value;
  } else {
    constructor[attributeMap] = {[propertyName]: value};
  }
};

export const property = (guard = null, options) => ({constructor}, propertyName) => {
  const value = guard !== null && options
    ? [guard, options]
    : guard;

  if (constructor[propertyMap]) {
    constructor[propertyMap][propertyName] = value;
  } else {
    constructor[propertyMap] = {[propertyName]: value};
  }
};

export const state = ({constructor}, propertyName) => {
  if (constructor[stateMap]) {
    constructor[stateMap].push(propertyName);
  } else {
    constructor[stateMap] = [propertyName];
  }
};

export const computed = (...watchings) => ({constructor}, propertyName) => {
  if (constructor[computedMap]) {
    constructor[computedMap][propertyName] = watchings;
  } else {
    constructor[computedMap] = {[propertyName]: watchings};
  }
};
