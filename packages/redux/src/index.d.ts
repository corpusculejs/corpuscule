import createContext, {CustomElement} from "@corpuscule/context";

export type Constructor<T, U = {}> = {
  new(...args: any[]): T; // tslint:disable-line:readonly-array
} & {
  readonly [P in keyof U]: U[P];
};

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
  <S, T extends Constructor<CustomElement, ReduxStatics<S>>>(target: T): T;
  <S, T extends Constructor<CustomElement>>(target: T): T & ReduxStatics<S>;
};

export const provider: ReturnType<typeof createContext>["provider"];
export const store: unique symbol;

export const dispatcherMap: unique symbol;
export const connectedMap: unique symbol;
