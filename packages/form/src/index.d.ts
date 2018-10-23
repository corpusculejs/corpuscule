import {
  Decorator,
  FormApi,
  FormState,
  FormSubscription,
} from "final-form";

export const formApi: unique symbol;
export const formState: unique symbol;

export interface FormDecoratorParams {
  readonly decorators?: ReadonlyArray<Decorator>;
  readonly subscription?: FormSubscription;
}

export interface FormProvider {
  readonly [formApi]: FormApi;
  readonly [formState]: FormState;
}

export const form: (params: FormDecoratorParams) => any;
