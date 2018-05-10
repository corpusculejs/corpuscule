import {PropertyGetter} from './types';

export const stored = <S = any>(getter: PropertyGetter<S>) => ({constructor}: any, propertyName: string): void => {
  if (!constructor._stored) {
    constructor._stored = {[propertyName]: getter};
  } else {
    constructor._stored[propertyName] = getter;
  }
};

export const dispatcher = ({constructor}: any, propertyName: string): void => {
  if (!constructor._dispatchers) {
    constructor._dispatchers = [propertyName];
  } else {
    constructor._dispatchers.push(propertyName);
  }
};
