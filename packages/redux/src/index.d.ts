import createContext from '@corpuscule/context';

export type PropertyGetter<S> = (state: S) => any;

export const connected: <S>(getter: PropertyGetter<S>) => PropertyDecorator;
export const dispatcher: PropertyDecorator;

export const connect: ClassDecorator;

export const provider: ReturnType<typeof createContext>['provider'];
export const store: unique symbol;
