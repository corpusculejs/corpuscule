import {Token, TokenCreator} from '@corpuscule/utils/lib/tokenRegistry';

export {
  isProvider as isProviderAdvanced,
  provider as providerAdvanced,
  value as apiAdvanced,
} from '@corpuscule/context';

export const gear: PropertyDecorator;
export const dispatcher: (eventKey?: PropertyKey) => PropertyDecorator;
export const isProvider: (target: unknown) => boolean;
export const provider: ClassDecorator;
export const storeon: ClassDecorator;
export const unit: <S extends object>(storeKey: keyof S) => PropertyDecorator;

export const createStoreonToken: TokenCreator;

export const dispatcherAdvanced: (token: Token) => PropertyDecorator;
export const storeonAdvanced: (token: Token) => ClassDecorator;
export const unitAdvanced: <S extends object>(token: Token, storeKey: keyof S) => PropertyDecorator;
