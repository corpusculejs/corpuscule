import createContext from "@corpuscule/context";
import {CustomElementClass, UncertainCustomElementClass} from "@corpuscule/typings";

export type DispatcherMap = ReadonlyArray<PropertyKey>;
export type PropertyGetter<S> = (state: S) => any;

export type ConnectedMap<S> = {
  readonly [P in PropertyKey]: PropertyGetter<S>;
};

export interface ReduxClass<T, S> extends CustomElementClass<T> {
  readonly [dispatcherMap]?: DispatcherMap;
  readonly [connectedMap]?: ConnectedMap<S>;
}

export const connect:
  <S, T = {}>(target: UncertainCustomElementClass<T>) => ReduxClass<T, S>;

export const provider: ReturnType<typeof createContext>["provider"];
export const store: unique symbol;

export const dispatcherMap: unique symbol;
export const connectedMap: unique symbol;
