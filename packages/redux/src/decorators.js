import {connectedMap, dispatcherMap} from ".";

export const connected = getter => ({constructor}, propertyKey) => {
  if (constructor[connectedMap]) {
    constructor[connectedMap][propertyKey] = getter;
  } else {
    constructor[connectedMap] = {[propertyKey]: getter};
  }
};

export const dispatcher = ({constructor}, propertyKey) => {
  if (constructor[dispatcherMap]) {
    constructor[dispatcherMap].push(propertyKey);
  } else {
    constructor[dispatcherMap] = [propertyKey];
  }
};
