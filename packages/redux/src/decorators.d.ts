import {PropertyGetter} from ".";

export const connected:
  <S = any>(getter: PropertyGetter<S>) =>
    (target: any, propertyKey: PropertyKey) => void;

export const dispatcher: (target: any, propertyKey: PropertyKey) => void;
