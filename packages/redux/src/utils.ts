// tslint:disable:no-invalid-this
import {Action, Store} from "redux";
import {DispatcherRegistry, PropertyGetter} from "./types";

export const initDispatchers = <S, A extends Action>(
  {prototype}: any,
  {dispatch}: Store<S, A>,
  dispatchers: DispatcherRegistry = [],
) => {
  for (const propertyName of dispatchers) {
    const method = prototype[propertyName];

    if (!method) {
      Object.defineProperty(prototype, propertyName, {
        configurable: true,
        set(this: any, value: Function): void {
          Object.defineProperty(this, propertyName, {
            configurable: true,
            value(...args: any[]): void {
              dispatch(value(...args));
            },
          });
        },
      });

      continue;
    }

    Object.defineProperty(prototype, propertyName, {
      value(...args: any[]): void {
        dispatch(method(...args));
      },
    });
  }
};

export const updateStoredProperties = <S, A extends Action>(
  instance: any,
  {getState}: Store<S, A>,
  registry: ReadonlyArray<[string, PropertyGetter<S>]>,
) => {
  for (const [propertyName, getter] of registry) {
    const nextValue = getter(getState());

    if (nextValue !== instance[propertyName]) {
      instance[propertyName] = nextValue;
    }
  }
};
