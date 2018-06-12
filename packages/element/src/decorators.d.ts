import {AttributeGuard, PropertyGuard, PropertyOptions} from ".";

export const element: (name: string) => <T>(target: T) => T;
export const attribute:
  (name: string, guard?: AttributeGuard, options?: PropertyOptions) =>
    (prototype: any, propertyKey: PropertyKey) => void;

export const property:
  (guard?: PropertyGuard, options?: PropertyOptions) =>
    (prototype: any, propertyName: PropertyKey) => void;

export const state: (prototype: any, propertyKey: PropertyKey) => void;

export const computed:
  (...watchings: Array<string | symbol>) => // tslint:disable-line:readonly-array
    (prototype: any, propertyKey: PropertyKey) => void;
