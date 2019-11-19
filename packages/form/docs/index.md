# @corpuscule/form

This module provides tools to handle web forms. Works as a connector to a
[🏁 Final Form](https://final-form.org/).

## Usage

```typescript
import {form, field} from '@corpuscule/form';
```

## API

### Structures

#### Form

- [FormDecoratorOptions](./FormDecoratorOptions.md).
- [FormGears](./FormGears.md).
- [FormOptions](./FormOptions.md).

#### Field

- [FieldDecoratorOptions](./FieldDecoratorOptions.md).
- [FieldGears](./FieldGears.md).
- [FieldInputProps](./FieldInputProps.md).
- [FieldMetaProps](./FieldMetaProps.md).
- [FieldOptions](./FieldOptions.md).

### Decorators

#### @gear

```typescript
function gear(responsibilityKey?: keyof FormGears | keyof FieldGears<unknown>): PropertyDecorator;
```

A default version of the [@gearAdvanced](#gearadvanced) with the token already
provided.

#### @field

```typescript
function field(options?: FieldDecoratorOptions): ClassDecorator;
```

A default version of the [@fieldAdvanced](#fieldadvanced) with the token already
provided.

#### @form

```typescript
function form(options?: FormDecoratorOptions): ClassDecorator;
```

A default version of the [@formAdvanced](#formadvanced) with the token already
provided.

#### @option

```typescript
function option(
  responsibilityKey?: keyof FormOptions | keyof FieldOptions<unknown>,
): PropertyDecorator;
```

A default version of the [@optionAdvanced](#optionadvanced) with the token
already provided.

#### @gearAdvanced

```typescript
function gearAdvanced(
  token: Token,
  responsibilityKey?: keyof FormGears | keyof FieldGears<unknown>,
): PropertyDecorator;
```

A decorator that converts a class property to a part of the 🏁 Final Form
interface. Both [@form](#formadvanced) and [@field](#fieldadvanced) decorators
require several specific `@gear` properties to exist.

- Properties of the [@form](#formadvanced) are described in the
  [FormGears](./FormGears.md) interface.
- Properties of the [@field](#fieldadvanced) are described in the
  [FieldGears](./FieldGears.md) interface.

If you do not plan to use the specific properties names, you can implement
the [FormGears](./FormGears.md) interface for the form or [FieldGears](./FieldGears.md)
for the field.

##### Parameters

- **token**: _[Token](../../utils/docs/tokenRegistry.md#token)_ - a token issued
  by a [createFormToken](#createformtoken) function that connects all decorators
  in a single working system.
- <sub>[optional]</sub> **responsibilityKey**: _keyof [FormGears](./FormGears.md)
  | keyof [FieldGears](./FieldGears.md)_ - a specific name of a gear that
  describes the responsibility of the property this decorator is applied to. If
  it is omitted, the name (or the description if it is a symbol) of the property
  will be used.

#### @fieldAdvanced

```typescript
function fieldAdvanced(token: Token, options?: FieldDecoratorOptions): ClassDecorator;
```

A decorator that makes a class declaration a 🏁 FinalForm field with a form
instance as a context value. The [@consumer](../../context/docs/index.md#consumer)
is used internally.

##### Parameters

- **token**: _[Token](../../utils/docs/tokenRegistry.md#token)_ - a token issued
  by a [createFormToken](#createformtoken) function that connects all decorators
  in a single working system.
- <sub>[optional]</sub> **options**: [FieldDecoratorOptions](./FieldDecoratorOptions.md) -
  an object that contains options to tune the field behavior.

#### @formAdvanced

```typescript
function formAdvanced(token: Token, options?: FormDecoratorOptions): ClassDecorator;
```

A decorator that makes a class declaration a 🏁 FinalForm provider with a
form instance as a context value. The [@provider](../../context/docs/index.md#provider)
decorator is used internally.

- **token**: _[Token](../../utils/docs/tokenRegistry.md#token)_ - a token issued
  by a [createFormToken](#createformtoken) function that connects all decorators
  in a single working system.
- <sub>[optional]</sub> **options**: [FormDecoratorOptions](./FormDecoratorOptions.md) -
  an object that contains options to tune the form behavior.

#### optionAdvanced

```typescript
function optionAdvanced(
  token: Token,
  responsibilityKey?: keyof FormOptions | keyof FieldOptions<unknown>,
): PropertyDecorator;
```

A decorator that converts a class property to a 🏁 Final Form option. Both
[@form](#formadvanced) and [@field](#fieldadvanced) have their options. Some
options are required; others can be omitted.

- Properties of the [@form](#formadvanced) are described in the [FormOptions](./FormOptions.md)
  interface.
- Properties of the [@field](#fieldadvanced) are described in the [FieldOptions](./FieldOptions.md)
  interface.

If you do not plan to use the specific properties names, you can implement
the [FormOptions](./FormOptions.md) interface for the form or [FieldOptions](./FieldOptions.md)
for the field.

##### Parameters

- **token**: _[Token](../../utils/docs/tokenRegistry.md#token)_ - a token issued
  by a [createFormToken](#createformtoken) function that connects all decorators
  in a single working system.
- <sub>[optional]</sub> **responsibilityKey**: _keyof [FormOptions](./FormOptions.md)
  | keyof [FieldOptions](./FieldOptions.md)_ - a specific name of an option that
  describes the responsibility of the property this decorator is applied to. If
  it is omitted, the name (or the description if it is a symbol) of the property
  will be used.

### Functions

#### createFormToken

```typescript
function createFormToken(): Token;
```

Creates tokens to bind decorators with each other.

##### Returns

**Type**: _[Token](../../utils/docs/tokenRegistry.md#token)_

#### isForm

```typescript
function isForm(klass: unknown): boolean;
```

A default version of the [@isFormAdvanced](#isformadvanced) with the token
already provided.

#### isFormAdvanced

```typescript
function isFormAdvanced(token: Token, klass: unknown): boolean;
```

Works as a [isProvider](../../context/docs/index.md#isprovider) for the
[@form](#formadvanced).

##### Parameters

- **token**: _[Token](../../utils/docs/tokenRegistry.md#token)_ - a token
  object.
- **klass**: _unknown_ - a class declaration to check.

##### Returns

**Type**: _boolean_
