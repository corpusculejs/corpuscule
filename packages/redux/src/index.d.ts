import createContext from '@corpuscule/context';

export type PropertyGetter<S> = (state: S) => any;

export const api: ReturnType<typeof createContext>['value'];
export const dispatcher: PropertyDecorator;
export const isProvider: ReturnType<typeof createContext>['isProvider'];
export const provider: ReturnType<typeof createContext>['provider'];
export const redux: ClassDecorator;
export const unit: <S>(getter: PropertyGetter<S>) => PropertyDecorator;

export interface ReduxContext {
  readonly api: ReturnType<typeof createContext>['value'];
  readonly dispatcher: PropertyDecorator;
  readonly isProvider: ReturnType<typeof createContext>['isProvider'];
  readonly provider: ReturnType<typeof createContext>['provider'];
  readonly redux: ClassDecorator;
  readonly unit: <S>(getter: PropertyGetter<S>) => PropertyDecorator;
}

export const createReduxContext: () => ReduxContext;
