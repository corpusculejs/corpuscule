import createContext from "@corpuscule/context";
import {UncertainCustomElementClass} from "@corpuscule/types";

export type DispatcherRegistry = ReadonlyArray<string>;
export type PropertyGetter<S> = (state: S) => any;

export interface ConnectedMap<S> {
  readonly [propertyName: string]: PropertyGetter<S>;
}

export interface ReduxStatics<S> {
  readonly [dispatcherMap]?: DispatcherRegistry;
  readonly [connectedMap]?: ConnectedMap<S>;
}

export const connect: {
  <S, T extends UncertainCustomElementClass<T>>(target: T & ReduxStatics<S>): T,
  <S, T extends UncertainCustomElementClass<T>>(target: T): T & ReduxStatics<S>,
};

export const provider: ReturnType<typeof createContext>["provider"];
export const store: unique symbol;

export const dispatcherMap: unique symbol;
export const connectedMap: unique symbol;
