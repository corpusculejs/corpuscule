import {
  Config,
  Decorator,
  FieldState, FieldSubscription,
  FormApi,
  FormState,
  FormSubscription, IsEqual,
} from "final-form";

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export const debug: unique symbol;
export const destroyOnUnregister: unique symbol;
export const initialValues: unique symbol;
export const keepDirtyOnReinitialize: unique symbol;
export const mutators: unique symbol;
export const onSubmit: unique symbol;
export const validateForm: unique symbol;
export const validateOnBlur: unique symbol;

export const initialValuesEqual: unique symbol;

export const formApi: unique symbol;
export const formState: unique symbol;

export interface FormDecoratorParams {
  readonly decorators?: ReadonlyArray<Decorator>;
  readonly subscription?: FormSubscription;
}

export interface Form {
  readonly [debug]?: Config["debug"];
  readonly [destroyOnUnregister]?: Config["destroyOnUnregister"];
  readonly [formApi]: FormApi;
  readonly [formState]: FormState;
  readonly [initialValues]?: Config["initialValues"];
  readonly [initialValuesEqual]?: (a?: object, b?: object) => boolean;
  readonly [keepDirtyOnReinitialize]?: Config["keepDirtyOnReinitialize"];
  readonly [mutators]?: Config["mutators"];
  readonly [onSubmit]?: Config["onSubmit"];
  readonly [validateForm]?: Config["validate"];
  readonly [validateOnBlur]?: Config["validateOnBlur"];
}

export const form: (params: FormDecoratorParams) => any;

export const allowNull: unique symbol;
export const format: unique symbol;
export const formatOnBlur: unique symbol;
export const isEqual: unique symbol;
export const name: unique symbol;
export const parse: unique symbol;
export const subscription: unique symbol;
export const validateField: unique symbol;
export const value: unique symbol;
export const input: unique symbol;
export const meta: unique symbol;

export interface FieldInputProps<T> {
  readonly checked?: boolean;
  readonly name: string;
  readonly onBlur: (event: Event) => void;
  readonly onChange: <U>(event: Event | U) => void;
  readonly onFocus: (event: Event) => void;
  readonly value: T;
}

export interface FieldMetaProps extends Omit<
  FieldState,
  "blur" | "change" | "focus" | "length" | "name" | "value"
> {}

export interface Field<T> {
  readonly [allowNull]?: boolean;
  readonly [format]?: ((value: any, name: string) => any) | null;
  readonly [formatOnBlur]?: boolean;
  readonly [parse]?: ((value: any, name: string) => any) | null;
  readonly [name]: string;
  readonly [isEqual]?: IsEqual;
  readonly [subscription]?: FieldSubscription;
  readonly [validateField]?: (value: any, allValues: object) => any;
  readonly [value]?: T;
  readonly [input]: FieldInputProps<T>;
  readonly [meta]: FieldMetaProps;
}
