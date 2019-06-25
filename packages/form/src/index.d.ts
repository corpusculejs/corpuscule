import {isProvider} from '@corpuscule/context';
import {Omit} from '@corpuscule/typings';
import {Token, TokenCreator} from '@corpuscule/utils/lib/tokenRegistry';
import {Decorator, FieldState, FormApi, FormSubscription} from 'final-form';

export {FormApi};

export interface FormDecoratorOptions {
  readonly decorators?: ReadonlyArray<Decorator>;
  readonly subscription?: FormSubscription;
}

export interface FieldDecoratorOptions {
  readonly auto?: boolean;
  readonly scheduler?: (callback: () => void) => Promise<void>;
  readonly selector?: string;
}

export interface FieldInputProps<T> {
  readonly name: string;
  readonly value: T;
}

export type FieldMetaProps<TFieldValue> = Omit<
  FieldState<TFieldValue>,
  'blur' | 'change' | 'focus' | 'length' | 'name' | 'value'
>;

export const createFormToken: TokenCreator;

export const api: PropertyDecorator;
export const field: (options?: FieldDecoratorOptions) => ClassDecorator;
export const form: (options?: FormDecoratorOptions) => ClassDecorator;
export const isForm: (target: unknown) => boolean;
export const option: PropertyDecorator;

export const apiAdvanced: (token: Token) => PropertyDecorator;
export const fieldAdvanced: (token: Token, options?: FieldDecoratorOptions) => ClassDecorator;
export const formAdvanced: (token: Token, options?: FormDecoratorOptions) => ClassDecorator;
export const isFormAdvanced: typeof isProvider;
export const optionAdvanced: (token: Token) => PropertyDecorator;
