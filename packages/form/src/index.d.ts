import {
  ConfigKey as FormConfigKey,
  Decorator,
  FieldState,
  FormApi,
  FormState,
  FormSubscription,
} from 'final-form';

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export const formApi: unique symbol;
export const formState: unique symbol;
export const compareInitialValues: unique symbol;

export interface FormDecoratorParams {
  readonly decorators?: ReadonlyArray<Decorator>;
  readonly subscription?: FormSubscription;
}

export interface Form {
  readonly [formApi]: FormApi;
  readonly [formState]: FormState;
  readonly [compareInitialValues]?: (a?: object, b?: object) => boolean;
}

export const formOption: (configKey: FormConfigKey) => PropertyDecorator;
export const form: (params?: FormDecoratorParams) => ClassDecorator;

export interface FieldInputProps<T> {
  readonly name: string;
  readonly onBlur: (event: Event) => void;
  readonly onChange: (event: Event | T) => void;
  readonly onFocus: (event: Event) => void;
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
  | 'validateField'
  | 'value';

export type FieldMetaProps = Omit<FieldState, 'blur' | 'change' | 'focus' | 'length' | 'name' | 'value'>;

export const input: unique symbol;
export const meta: unique symbol;

export interface Field<T> {
  readonly [formApi]: FormApi;
  readonly [input]: FieldInputProps<T>;
  readonly [meta]: FieldMetaProps;
}

export const fieldOption: (configKey: FieldConfigKey) => PropertyDecorator;
export const field: ClassDecorator;
