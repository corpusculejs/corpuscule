import {Token, TokenCreator} from '@corpuscule/utils/lib/tokenizer';

export const consumer: (token: Token) => ClassDecorator;
export const createContextToken: TokenCreator;
export const isProvider: (token: Token, target: unknown) => boolean;
export const provider: (token: Token, defaultValue?: unknown) => ClassDecorator;
export const value: (token: Token) => PropertyDecorator;
