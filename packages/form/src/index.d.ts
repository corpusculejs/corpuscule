import {Omit} from '@corpuscule/typings';
import {
  ConfigKey as FormConfigKey,
  Decorator,
  FieldState,
  FormApi,
  FormState,
  FormSubscription,
} from 'final-form';

export {FormApi};

export const formState: unique symbol;
export const compareInitialValues: unique symbol;

export interface FormDecoratorParams {
  readonly decorators?: ReadonlyArray<Decorator>;
  readonly subscription?: FormSubscription;
}

export interface Form {
  readonly [formState]: FormState;
  readonly [compareInitialValues]?: (a?: object, b?: object) => boolean;
}

export type FormDecorator = (params?: FormDecoratorParams) => ClassDecorator;

export const formOption: (configKey: FormConfigKey) => PropertyDecorator;

export interface FieldInputProps<T> {
  readonly name: string;
  readonly value: T;
}

export type FieldConfigKey =
  | 'format'
  | 'formatOnBlur'
  | 'isEqual'
  | 'name'
  | 'parse'
  | 'subscription'
  | 'validate'
  | 'validateFields'
  | 'value';

export type FieldMetaProps = Omit<
  FieldState,
  'blur' | 'change' | 'focus' | 'length' | 'name' | 'value'
>;

export interface FieldDecoratorParams {
  readonly scheduler?: (callback: () => void) => Promise<void>;
}

export const input: unique symbol;
export const meta: unique symbol;

export interface Field<T> {
  readonly [input]: FieldInputProps<T>;
  readonly [meta]: FieldMetaProps;
}

export type FieldDecorator = (params?: FieldDecoratorParams) => ClassDecorator;

export const fieldOption: (configKey: FieldConfigKey) => PropertyDecorator;

export interface FormContext {
  readonly formApi: 'formApi'; // hack to resolve unique symbol widening
  readonly form: FormDecorator;
  readonly field: FieldDecorator;
}

export const createFormContext: () => FormContext;
