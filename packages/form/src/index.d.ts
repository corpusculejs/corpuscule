/**
 * This module provides tools to handle web forms. Works as a connector to a
 * [🏁 Final Form](https://github.com/final-form/final-form).
 *
 * @module @corpuscule/form
 */

/**
 * Do not remove this comment; it keeps typedoc from misplacing the module
 * docs.
 */

import {isProvider} from '@corpuscule/context';
import {Omit} from '@corpuscule/typings';
import {Token} from '@corpuscule/utils/lib/tokenRegistry';
import {
  Config as FormConfig,
  Decorator,
  FieldState,
  FormApi,
  FormState,
  FormSubscription,
} from 'final-form';

export {FormApi};

export interface FormDecoratorOptions {
  /**
   * A list of [🏁 FinalForm decorators](https://github.com/final-form/final-form#decorator-form-formapi--unsubscribe)
   * to apply to the form.
   */
  readonly decorators?: ReadonlyArray<Decorator>;

  /**
   * A list of form channels to notify when a part of the form is changed. All
   * channels are described in the [`FormSubscription`](https://github.com/final-form/final-form#formsubscription--string-boolean-)
   * interface. If this property is omitted, the subscription will be issued on
   * all channels.
   */
  readonly subscription?: FormSubscription;
}

/**
 * This interface is not necessary to be implemented because it covers only the
 * one case when all your properties are string and you do not plan to use
 * specific property names.
 */
export interface FormGears<TFormValues> {
  /**
   * Contains a form instance and allows working with the
   * [🏁 FinalForm API](https://github.com/final-form/final-form#formapi).
   */
  readonly formApi: FormApi;

  /**
   * Contains [`FormState`](https://github.com/final-form/final-form#formstate)
   * object. Is updated each time the form is changed.
   */
  readonly state: FormState<TFormValues>;
}

/**
 * See the [FormConfig](https://github.com/final-form/final-form#config)
 * documentation.
 *
 * This interface is not necessary to be implemented because it covers only the
 * one case when all your properties are string and you do not plan to use
 * specific property names.
 */
export interface FormOptions<TFormValues = object> extends FormConfig<TFormValues> {
  /**
   * Used to compare new initial values that are received by [initialValues](https://github.com/final-form/final-form#initialvalues-object)
   * option. By default the [shallowEqual]{@link @corpuscule/utils/lib/shallowEqual.shallowEqual}
   * function.
   *
   * @param prevInitialValues
   * @param nextInitialValues
   */
  compareInitialValues?(prevInitialValues: object, nextInitialValues: object): boolean;
}

export interface FieldDecoratorOptions {
  /**
   * Transforms a regular field to an auto field.
   *
   * Auto fields are allowed not only to receive data comes up from native form
   * elements with change events but also to change these elements values by
   * form updates. It happens automatically and does not require specific
   * actions from the user.
   */
  readonly auto?: boolean;

  /**
   * This option defines a selector for the `querySelectorAll` method that will
   * be used by an auto field to collect children form elements like `<input>`,
   * `<textarea>`, etc. in order to apply the form changes to them. By default,
   * it is `input, select, textarea`.
   */
  readonly childrenSelector?: string;

  /**
   * This option defines the function that schedules the re-subscription to the
   * form instance. It is necessary to avoid multiple subscriptions if several
   * options that require it are changed.
   *
   * @param task a callback that will be run at the scheduled time.
   */
  scheduler?(task: () => void): Promise<void>;
}

/**
 * This interface is not necessary to be implemented because it covers only the
 * one case when all your properties are string and you do not plan to use
 * specific property names.
 */
export interface FieldGears<TFieldValue> {
  /**
   * Contains a form instance and allows working with the
   * [🏁 FinalForm API](https://github.com/final-form/final-form#formapi).
   */
  readonly formApi: FormApi;

  /**
   * Contains the general field data that can be provided directly to the
   * `HTMLInputElement`.
   */
  readonly input: FieldInputProps<TFieldValue>;

  /**
   * Contains the internal field data that allows making decision about
   * displaying and interaction with the field. The values in meta are
   * dependent on you having subscribed to them via the
   * [[FormDecoratorOptions.subscription]].
   */
  readonly meta: FieldMetaProps<TFieldValue>;
}

/**
 * See the [FieldState](https://github.com/final-form/final-form#active-boolean)
 * documentation. This interface contains every option from it except for:
 * * `blur`,
 * * `change`,
 * * `focus`,
 * * `length`,
 * * `name`,
 * * `value`,
 *
 * This interface is not necessary to be implemented because it covers only the
 * one case when all your properties are string and you do not plan to use
 * specific property names.
 */
export type FieldOptions<TFieldValue> = Omit<
  FieldState<TFieldValue>,
  'blur' | 'change' | 'focus' | 'length' | 'name' | 'value'
>;

export interface FieldInputProps<TFieldValue> {
  /**
   * A name of the field.
   */
  readonly name: string;

  /**
   * A current value of the field.
   */
  readonly value: TFieldValue;
}

export type FieldMetaProps<TFieldValue> = FieldOptions<TFieldValue>;

/**
 * Creates tokens to bind decorators with each other.
 */
export function createFormToken(): Token;

/**
 * A default version of the [@apiAdvanced]{@link apiAdvanced} with the
 * token already provided.
 */
export const api: PropertyDecorator;

/**
 * A default version of the [@fieldAdvanced]{@link fieldAdvanced} with the
 * token already provided.
 */
export function field(options?: FieldDecoratorOptions): ClassDecorator;

/**
 * A default version of the [@formAdvanced]{@link formAdvanced} with the
 * token already provided.
 */
export function form(options?: FormDecoratorOptions): ClassDecorator;

/**
 * A default version of the [@isFormAdvanced]{@link isFormAdvanced} with the
 * token already provided.
 */
export function isForm(target: unknown): boolean;

/**
 * A default version of the [@optionAdvanced]{@link optionAdvanced} with the
 * token already provided.
 */
export const option: PropertyDecorator;

/**
 * A decorator that converts a class property to a part of the 🏁 Final Form
 * interface. Both [@form]{@link formAdvanced} and [@field]{@link fieldAdvanced}
 * decorators require several specific @api properties to exist.
 * * Properties of the [@form]{@link formAdvanced} are described in the
 * [[FormGears]] interface.
 * * Properties of the [@field]{@link fieldAdvanced} are described in the
 * [[FieldGears]] interface.
 *
 * If you do not plan to use the specific properties names, you can implement
 * the [[FormGears]] interface for the form or [[FieldGears]] for the field.
 *
 * @param token a token issued by a [[createFormToken]] function that connects
 * all decorators in a single working system.
 */
export function apiAdvanced(token: Token): PropertyDecorator;

/**
 * A decorator that makes a class declaration a 🏁 FinalForm field with a form
 * instance as a context value. The [@consumer]{@link @corpuscule/context.consumer}
 * is used internally.
 *
 * @param token a token issued by a [[createFormToken]] function that connects
 * all decorators in a single working system.
 *
 * @param options an object that contains options to tune the field behavior.
 */
export function fieldAdvanced(token: Token, options?: FieldDecoratorOptions): ClassDecorator;

/**
 * A decorator that makes a class declaration a 🏁 FinalForm provider with a
 * form instance as a context value. The [@provider]{@link @corpuscule/context.provider}
 * decorator is used internally.
 *
 * @param token a token issued by a [[createFormToken]] function that connects
 * all decorators in a single working system.
 *
 * @param options an object that contains options to tune the form behavior.
 */
export function formAdvanced(token: Token, options?: FormDecoratorOptions): ClassDecorator;

/**
 * Works as a [isProvider]{@link @corpuscule/context.isProvider} for the
 * [@form]{@link formAdvanced}.
 */
export const isFormAdvanced: typeof isProvider;

/**
 * A decorator that converts a class property to a 🏁 Final Form option. Both
 * [@form]{@link formAdvanced} and [@field]{@link fieldAdvanced} have their
 * options. Some options are required; others can be omitted.
 * * Properties of the [@form]{@link formAdvanced} are described in the
 * [[FormOptions]] interface.
 * * Properties of the [@field]{@link fieldAdvanced} are described in the
 * [[FieldOptions]] interface.
 *
 * If you do not plan to use the specific properties names, you can implement
 * the [[FormGears]] interface for the form or [[FieldGears]] for the field.
 *
 * @param token a token issued by a [[createFormToken]] function that connects
 * all decorators in a single working system.
 */
export function optionAdvanced(token: Token): PropertyDecorator;
