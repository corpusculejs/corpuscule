import createContext from "@corpuscule/context";
import {CustomElementClass, UncertainCustomElementClass} from "@corpuscule/types";

export type DispatcherRegistry = ReadonlyArray<string>;
export type PropertyGetter<S> = (state: S) => any;

export interface ConnectedMap<S> {
  readonly [propertyName: string]: PropertyGetter<S>;
}

export interface ReduxClass<T, S> extends CustomElementClass<T> {
  readonly [dispatcherMap]?: DispatcherRegistry;
  readonly [connectedMap]?: ConnectedMap<S>;
}

export const connect:
  <S, T = {}>(target: UncertainCustomElementClass<T>) => ReduxClass<T, S>;

export const provider: ReturnType<typeof createContext>["provider"];
export const store: unique symbol;

export const dispatcherMap: unique symbol;
export const connectedMap: unique symbol;
