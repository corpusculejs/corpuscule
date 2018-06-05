import {dispatcherMap, storedMap} from ".";
import {PropertyGetter} from "./types";

export const stored = <S = any>(getter: PropertyGetter<S>) => ({constructor}: any, propertyName: string): void => {
  if (!constructor[storedMap]) {
    constructor[storedMap] = {[propertyName]: getter};
  } else {
    constructor[storedMap][propertyName] = getter;
  }
};

export const dispatcher = ({constructor}: any, propertyName: string): void => {
  if (!constructor[dispatcherMap]) {
    constructor[dispatcherMap] = [propertyName];
  } else {
    constructor[dispatcherMap].push(propertyName);
  }
};
