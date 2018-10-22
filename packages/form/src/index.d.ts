import {
  Decorator,
  FormApi,
  FormState,
  FormSubscription,
} from "final-form";

export const formInstance: unique symbol;
export const formState: unique symbol;

export interface FormDecoratorParams {
  readonly decorators?: ReadonlyArray<Decorator>;
  readonly subscription?: FormSubscription;
}

export interface FormProvider {
  readonly [formInstance]: FormApi;
  readonly [formState]: FormState;
}

export const form: (params: FormDecoratorParams) => any;
