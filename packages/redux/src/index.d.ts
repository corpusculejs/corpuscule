import createContext from "@corpuscule/context";
import {FieldDecorator} from "@corpuscule/typings";

export type PropertyGetter<S> = (state: S) => any;

export const connected: <S>(getter: PropertyGetter<S>) => FieldDecorator;
export const dispatcher: FieldDecorator;

export const connect: ClassDecorator;

export const provider: ReturnType<typeof createContext>["provider"];
export const store: unique symbol;
