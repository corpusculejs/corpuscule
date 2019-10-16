# @corpuscule/form

This module provides tools to handle web forms. Works as a connector to a
[🏁 Final Form](https://final-form.org/).

## Usage

```typescript
import {form, field} from '@corpuscule/utils/lib/asserts';
```

## API

### FormDecoratorOptions

```typescript
type FormDecoratorOptions = {
  readonly decorators?: ReadonlyArray<Decorator>;
  readonly subscription?: Record<keyof FormState, boolean>;
};
```

#### decorators

```
readonly decorators?: ReadonlyArray<Decorator>;
```

A list of [🏁 FinalForm decorators](https://final-form.org/docs/final-form/types/Decorator)
to apply to the form.

#### subscription

```
readonly subscription?: Record<keyof FormState, boolean>;
```

A list of form channels to notify when a part of the form is changed. All
channels are described in the [`FormState`](https://final-form.org/docs/final-form/types/FormState)
interface. If this property is omitted, the subscription will be issued on
all channels.

### FormGears

```typescript
type FormGears<TFormValues = object> = {
  readonly formApi: FormApi;
  readonly state: FormState<FormValues>;
};
```

This interface is not necessary to be implemented because it covers only the one
case when all your properties are string and you do not plan to use specific
property names.

#### formApi

```
readonly formApi: FormApi;
```

Contains a form instance and allows working with the [🏁 FinalForm API](https://final-form.org/docs/final-form/types/FormApi).

#### state

```
readonly state: FormState<FormValues>;
```

Contains [`FormState`](https://final-form.org/docs/final-form/types/FormState)
object. Is updated each time the form is changed.

### FormOptions

```typescript
type FormOptions<TFormValues = object> = FormConfig<TFormValues> & {
  readonly compareInitialValues?: (prevInitialValues: object, nextInitialValues: object) => boolean;
};
```

See the [FormConfig](https://final-form.org/docs/final-form/types/Config)
documentation.

This interface is not necessary to be implemented because it covers only the
one case when all your properties are string and you do not plan to use
specific property names.

#### compareInitialValues

```
readonly compareInitialValues?: (prevInitialValues: object, nextInitialValues: object) => boolean;
```

Used to compare new initial values that are received by [initialValues](https://github.com/final-form/final-form#initialvalues-object)
option. By default the [shallowEqual](../../utils/docs/shallowEqual.md#shallowequal)
function.

##### Parameters

- `prevInitialValues` - object that contains previous set of initial values.
- `nextInitialValues` - object that contains current set of initial values.

### FieldDecoratorOptions

```typescript
type FieldDecoratorOptions = {
  readonly auto?: boolean;

  readonly childrenSelector?: string;

  readonly scheduler?: (task: () => void) => Promise<void>;
};
```

#### auto

```
readonly auto?: boolean;
```

Transforms a regular field to an auto field.

Auto fields are allowed not only to receive data comes up from native form
elements with change events but also to change these elements values by form
updates. It happens automatically and does not require specific actions from the
user.

#### childrenSelector

```
readonly childrenSelector?: string;
```

This option defines a selector for the `querySelectorAll` method that will be
used by an auto field to collect children form elements like `<input>`,
`<textarea>`, etc. in order to apply the form changes to them. By default, it is
`input, select, textarea`.

#### scheduler

```
readonly scheduler?: (task: () => void) => Promise<void>;
```

This option defines the function that schedules the re-subscription to the form
instance. It is necessary to avoid multiple subscriptions if several options
that require it are changed.

##### Parameters

- `task` - a callback that will be run at the scheduled time.

### FieldGears

```typescript
type FieldGears<TFieldValue> = {
  readonly formApi: FormApi;
  readonly input: FieldInputProps<TFieldValue>;
  readonly meta: FieldMetaProps<TFieldValue>;
};
```

This type is not necessary to be implemented because it covers only the one case
when all your properties are string and you do not plan to use specific property
names.

#### formApi

```
readonly formApi: FormApi;
```

Contains a form instance and allows working with the [🏁 FinalForm API](https://github.com/final-form/final-form#formapi).

#### input

```
readonly input: FieldInputProps<TFieldValue>;
```

See [FieldInputProps](#fieldinputprops) type for details.

#### meta

```
readonly meta: FieldMetaProps<TFieldValue>;
```

See [FieldMetaProps](#fieldmetaprops) type for details.

### FieldOptions

```typescript
type FieldOptions<TFieldValue> = Omit<
  FieldState<TFieldValue>,
  'blur' | 'change' | 'focus' | 'length'
>;
```

See the [FieldState](https://final-form.org/docs/final-form/types/FieldState)
documentation. This type contains every option from it except for:

- `blur`,
- `change`,
- `focus`,
- `length`.

This interface is not necessary to be implemented because it covers only the one
case when all your properties are string and you do not plan to use specific
property names.

### FieldInputProps

```typescript
interface FieldInputProps<TFieldValue> {
  readonly name: string;
  readonly value: TFieldValue;
}
```

Contains the general field data that can be provided directly to the
`HTMLInputElement`.

#### name

```
readonly name: string;
```

A name of the field.

#### value

```
readonly value: TFieldValue;
```

A current value of the field.

### FieldMetaProps

```typescript
type FieldMetaProps<TFieldValue> = Omit<FieldOptions<TFieldValue>, 'name' | 'value'>;
```

Contains the internal field data that allows making decision about displaying
and interaction with the field. The values in meta are dependent on you having
subscribed to them via the [subscription](#subscription).

See [FieldOptions](#fieldoptions) type for details.

### @gear

```typescript
function gear(responsibilityKey?: keyof FormGears | keyof FieldGears<unknown>): PropertyDecorator;
```

A default version of the [@gearAdvanced](#gearadvanced) with the token already
provided.

### @field

```typescript
function field(options?: FieldDecoratorOptions): ClassDecorator;
```

A default version of the [@fieldAdvanced](#fieldadvanced) with the token already
provided.

### @form

```typescript
function form(options?: FormDecoratorOptions): ClassDecorator;
```

A default version of the [@formAdvanced](#formadvanced) with the token already
provided.

### @option

```typescript
function option(
  responsibilityKey?: keyof FormOptions | keyof FieldOptions<unknown>,
): PropertyDecorator;
```

A default version of the [@optionAdvanced](#optionadvanced) with the token
already provided.

### @gearAdvanced

```typescript
function gearAdvanced(
  token: Token,
  responsibilityKey?: keyof FormGears | keyof FieldGears<unknown>,
): PropertyDecorator;
```

A decorator that converts a class property to a part of the 🏁 Final Form
interface. Both [@form](#formadvanced) and [@field](#fieldadvanced) decorators
require several specific @gear properties to exist.

- Properties of the [@form](#formadvanced) are described in the
  [FormGears](#formgears) interface.
- Properties of the [@field](#fieldadvanced) are described in the
  [FieldGears](#fieldgears) interface.

If you do not plan to use the specific properties names, you can implement
the [FormGears](#formgears) interface for the form or [FormGears](#formgears) for the field.

##### Parameters

- `token` - a token issued by a [createFormToken](#createformtoken) function
  that connects all decorators in a single working system.
- `responsibilityKey` - a specific name of a gear that describes the
  responsibility of the property this decorator is applied to. If it is omitted,
  the name (or the description if it is a symbol) of the property will be used.

### @fieldAdvanced

```typescript
function fieldAdvanced(token: Token, options?: FieldDecoratorOptions): ClassDecorator;
```

A decorator that makes a class declaration a 🏁 FinalForm field with a form
instance as a context value. The [@consumer](../../context/docs/context.md#consumer)
is used internally.

##### Parameters

- `token` - a token issued by a [createFormToken]() function that connects
  all decorators in a single working system.
- `options` - an object that contains options to tune the field behavior.

### @formAdvanced

```typescript
function formAdvanced(token: Token, options?: FormDecoratorOptions): ClassDecorator;
```

A decorator that makes a class declaration a 🏁 FinalForm provider with a
form instance as a context value. The [@provider](../../context/docs/context.md#provider)
decorator is used internally.

- `token` - a token issued by a [createFormToken](#createformtoken) function
  that connects all decorators in a single working system.
- `options` - an object that contains options to tune the form behavior.

### optionAdvanced

```typescript
function optionAdvanced(
  token: Token,
  responsibilityKey?: keyof FormOptions | keyof FieldOptions<unknown>,
): PropertyDecorator;
```

A decorator that converts a class property to a 🏁 Final Form option. Both
[@form](#formadvanced) and [@field](#fieldadvanced) have their options. Some
options are required; others can be omitted.

- Properties of the [@form](#formadvanced) are described in the [FormOptions](#formoptions)
  interface.
- Properties of the [@field](#fieldadvanced) are described in the [FieldOptions](#fieldoptions)
  interface.

If you do not plan to use the specific properties names, you can implement
the [FormGears](#formgears) interface for the form or [FormGears](#formgears) for the field.

##### Parameters

- `token` - a token issued by a [createFormToken](#createformtoken) function
  that connects all decorators in a single working system.
- `responsibilityKey` - a specific name of an option that describes the
  responsibility of the property this decorator is applied to. If it is
  omitted, the name (or the description if it is a symbol) of the property will
  be used.

### createFormToken

```typescript
function createFormToken(): Token;
```

Creates [tokens](../../utils/docs/tokenRegistry.md#token) to bind decorators
with each other.

### isForm

```typescript
function isForm(klass: unknown): boolean;
```

A default version of the [@isFormAdvanced](#isformadvanced) with the token
already provided.

### isFormAdvanced

```typescript
function isFormAdvanced(token: Token, klass: unknown): boolean;
```

Works as a [isProvider](../../context/docs/context.md#isprovider) for the
[@form](#formadvanced).

##### Parameters

- `token` - a [Token](../../utils/docs/tokenRegistry.md#token) object.
- `klass` - a class declaration to check.

##### Returns

A `boolean` result of the check.
