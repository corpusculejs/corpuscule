import {Token, TokenCreator} from '@corpuscule/utils/lib/tokenRegistry';

export {
  isProvider as isProviderAdvanced,
  provider as providerAdvanced,
  value as gearAdvanced,
} from '@corpuscule/context';

export type PropertyGetter<S> = (state: S) => any;

export const gear: PropertyDecorator;
export const dispatcher: PropertyDecorator;
export const isProvider: (target: unknown) => boolean;
export const provider: ClassDecorator;
export const redux: ClassDecorator;
export const unit: <S>(getter: PropertyGetter<S>) => PropertyDecorator;

export const createReduxToken: TokenCreator;

export const dispatcherAdvanced: (token: Token) => PropertyDecorator;
export const reduxAdvanced: (token: Token) => ClassDecorator;
export const unitAdvanced: <S>(token: Token, getter: PropertyGetter<S>) => PropertyDecorator;
