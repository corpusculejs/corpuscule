import createContext from '@corpuscule/context';
import {Omit} from '@corpuscule/typings';
import {Decorator, FieldState, FormApi, FormSubscription} from 'final-form';

export {FormApi};

export interface FormDecoratorParams {
  readonly decorators?: ReadonlyArray<Decorator>;
  readonly subscription?: FormSubscription;
}

export interface FieldDecoratorParams {
  readonly auto?: boolean;
  readonly selector?: string;
}

export type FormDecorator = (params?: FormDecoratorParams) => ClassDecorator;
export type FieldDecorator = (params?: FieldDecoratorParams) => ClassDecorator;

export interface FieldInputProps<T> {
  readonly name: string;
  readonly value: T;
}

export type FieldMetaProps = Omit<
  FieldState,
  'blur' | 'change' | 'focus' | 'length' | 'name' | 'value'
>;

export interface FormContextOptions {
  readonly scheduler?: (callback: () => void) => Promise<void>;
}

export const api: PropertyDecorator;
export const form: FormDecorator;
export const field: FieldDecorator;
export const isForm: ReturnType<typeof createContext>['isProvider'];
export const option: PropertyDecorator;

export interface FormContext {
  readonly api: PropertyDecorator;
  readonly form: FormDecorator;
  readonly field: FieldDecorator;
  readonly isForm: ReturnType<typeof createContext>['isProvider'];
  readonly option: PropertyDecorator;
}

export const createFormContext: (options?: FormContextOptions) => FormContext;
