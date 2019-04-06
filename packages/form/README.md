> ## 🛠 Status: In Development
> This package is currently under heavy development. Feedback is always welcome, but be careful with
using it in production. API is not ready yet and can receive large changes.

# `@corpuscule/form`
[![Latest Stable Version](https://img.shields.io/npm/v/@corpuscule/form.svg)](https://www.npmjs.com/package/@corpuscule/form)
[![Package size](https://badgen.net/bundlephobia/minzip/@corpuscule/form)](https://bundlephobia.com/result?p=@corpuscule/form)

Lightweight set of decorators for providing solid form experience for web components. Works as a
connector to [🏁 Final Form](https://github.com/final-form/final-form).

## Features
* **Small**. According to [Bundlephobia](https://bundlephobia.com), it has following sizes:
  * [![Package size](https://badgen.net/bundlephobia/min/@corpuscule/form)](https://bundlephobia.com/result?p=@corpuscule/form)
  * [![Package size](https://badgen.net/bundlephobia/minzip/@corpuscule/form)](https://bundlephobia.com/result?p=@corpuscule/form)
* **Typed**. [Typescript](http://www.typescriptlang.org/) typings are included.

## Installation
```bash
$ npm install --save final-form @corpuscule/form
``` 
or
```bash
$ yarn add final-form @corpuscule/form
```

## Concepts
### Auto Field
Auto fields are allowed not only to receive data comes up from native form elements with change 
events but also to change these elements values by form updates. It happens automatically and does
not require specific actions from the user.  

To create an auto field add `{auto: true}` as a parameter for `@field` decorator creator. It will
allow the field to receive changes from native form elements and update them on form change. Second
parameter key, `selector`, can be used to make `querySelectorAll` request more specific. By default,
it is `input, select, textarea`. You can make it wider by adding custom elements, like `input,
select, textarea, my-element`, or make it more specific by removing or replacing native elements.

Now, each change of native form element will change the corresponding form field, and each form
update will change the value of native elements. The field also sets `name` properties of all
selected elements to its name, so it is useless to set names manually.
```html
<script>
  @field({auto: true, selector: 'input'})
  class Field extends HTMLElement {
    @api formApi;
    @api input;
    @api meta;

    @option name;
  }
  
  customElements.define('x-field', Field);
</script>
<x-form>
  <x-field name="foo-bar">
    <input type="radio" value="foo">
    <input type="radio" value="bar">
  </x-field>
</x-form>
```
#### Customized Built-In Element
You can also do the same with customized built-in elements. The only difference is that CB elements
will change themselves instead of searching native elements.
```html
<script>
  @field({auto: true})
  class Field extends HTMLSelectElement {
    @api formApi;
    @api input;
    @api meta;

    @option name = 'foo-bar';
  }
  
  customElements.define('x-field', Field, {extends: 'input'});
</script>
<x-form>
  <input is="x-field" type="radio" value="foo">
  <input is="x-field" type="radio" value="bar">
</x-form>
```

## API
### Common
#### `@api: PropertyDecorator`
Class fields marked with this decorators become part of the 🏁 FinalForm API. It works with
following rules:
* Any kind of property can be marked with `@api` decorator: string, symbolic or private. 
* Property should have the same name as the API element it implements.
  * String property should just have the API element name, e.g. `form`.
  * Symbolic property should have description identical to the API element name, e.g. `const form =
  Symbol('form')`.
  * Private property should have description identical to the API element name, e.g. `#form` or
  `new PrivateName('form')`.
* Only one property is allowed for each API element.

`@api` decorator works differently for [`@form` class](#form-api-decorator) and [`@field` class](#field-api-decorator).

#### `@option: PropertyDecorator`
Class fields marked with this decorators can contain Form and Field options that has ability to
change during the class lifetime. It works with the same rules as [`@api`](#api-propertydecorator)
decorator.

`@option` decorator works differently for [`@form` class](#form-option-decorator) and
[`@field` class](#field-option-decorator).

### Form
#### `@form(options?: FormDecoratorOptions): ClassDecorator`
Form decorator makes the element a 🏁 FinalForm provider via [`@corpsucule/context`](../context)
with form instance as a context value. 

The decorator can receive `FormDecoratorOptions` object which contains:
* `decorators?: Decorator[]` - a list of [🏁 FinalForm decorators](https://github.com/final-form/final-form#decorator-form-formapi--unsubscribe)
to apply to the form.
* `subscription?: FormSubscription` - a [`FormSubscription`](https://github.com/final-form/final-form#formsubscription--string-boolean-)
that selects all of the items of [`FormState`](https://github.com/final-form/final-form#formstate)
that you wish to update for. If you don't pass a subscription prop, it defaults to all of
`FormState`.

#### Form `@api` decorator
Form `@api` decorator has following property names it can be applied to:
* `form` - a property that contains form instance. The purpose of this property is to
allow working with the [🏁 FinalForm API](https://github.com/final-form/final-form#formapi).
* `state` - a property that contains [`FormState`](https://github.com/final-form/final-form#formstate).
It is updated each time form is changed.

#### Form `@option` decorator
Allowed properties names are following. Detailed description of form options (except
`compareInitialValues`) can be found at [🏁 FinalForm Config](https://github.com/final-form/final-form#config)
section.

| Name                      | Kind     | Required? |
|---------------------------|----------|-----------|
| `compareInitialValues`    | `method` |           |
| `debug`                   | `method` |           |
| `destroyOnUnregister`     |  `field` |           |
| `keepDirtyOnReinitialize` |  `field` |           |
| `initialValues`           |  `field` |           |
| `mutators`                |  `field` |           |
| `onSubmit`                | `method` |     ✓     |
| `validate`                | `method` |           |
| `validateOnBlur`          |  `field` |           | 

##### `compareInitialValues: (a: object, b: object) => boolean`
This function is used to compare new initial values that are received by `initialValues` form
option. By default simple checking of shallow equality is performed.

#### `@field(options?: FieldDecoratorOptions): ClassDecorator`
Field decorator makes the element a 🏁 FinalForm field, a consumer via [`@corpsucule/context`](../context)
with form instance as a context value.

The decorator can receive `FieldDecoratorOptions` object which contains:
* `auto?: boolean` - a property that creates [Auto Field](#autofield) from a simple `Field`.
* `selector?: string` - Auto Field uses this selector to search native form elements in the light
DOM. More details [here](#autofield).
* `scheduler: (callback: () => void) => Promise<void>`. Function that performs scheduling for your
field element. By default, [`@corpuscule/utils` scheduler](../utils/README.md#scheduler) is used.

#### Field `@api` decorator
Field `@api` decorator has following property names it can be applied to:
* `form` - a property that contains form instance. The purpose of this property is to
allow working with the [🏁 FinalForm API](https://github.com/final-form/final-form#formapi).
* `input` - a property that contains `FieldInputProps` object.
* `meta` - a property that contains `FieldMetaProps` object.

##### `FieldInputProps<T>`
###### `name: string`
The name of the field.

###### `value: T`
The current value of the field.

##### `FieldMetaProps`
###### `active?: boolean`
[See the 🏁 Final Form docs on `active`](https://github.com/final-form/final-form#active-boolean).

###### `data?: Object`
[See the 🏁 Final Form docs on `data`](https://github.com/final-form/final-form#data-object).

###### `dirty?: boolean`
[See the 🏁 Final Form docs on `dirty`](https://github.com/final-form/final-form#dirty-boolean).

###### `error?: any`
[See the 🏁 Final Form docs on `error`](https://github.com/final-form/final-form#error-any).

###### `initial?: any`
[See the 🏁 Final Form docs on `initial`](https://github.com/final-form/final-form#initial-any).

###### `invalid?: boolean`
[See the 🏁 Final Form docs on `invalid`](https://github.com/final-form/final-form#invalid-boolean).

###### `pristine?: boolean`
[See the 🏁 Final Form docs on `pristine`](https://github.com/final-form/final-form#pristine-boolean).

###### `submitError?: any`
[See the 🏁 Final Form docs on `submitError`](https://github.com/final-form/final-form#submiterror-any).

###### `submitFailed?: boolean`
[See the 🏁 Final Form docs on `submitFailed`](https://github.com/final-form/final-form#submitfailed-boolean).

###### `submitSucceeded?: boolean`
[See the 🏁 Final Form docs on `submitSucceeded`](https://github.com/final-form/final-form#submitsucceeded-boolean).

###### `submitting?: boolean`
[See the 🏁 Final Form docs on `submitting`](https://github.com/final-form/final-form#submitting-boolean).

###### `touched?: boolean`
[See the 🏁 Final Form docs on `touched`](https://github.com/final-form/final-form#touched-boolean).

###### `valid?: boolean`
[See the 🏁 Final Form docs on `valid`](https://github.com/final-form/final-form#valid-boolean).

###### `visited?: boolean`
[See the 🏁 Final Form docs on `visited`](https://github.com/final-form/final-form#visited-boolean).

#### Field `@option` decorator
Field `@option` decorator has following properties it can be applied to.

##### `format?: ((value: any, name: string) => any)`
A function that takes the value from the form values and the name of the field and formats the
value to give to the input. Common use cases include converting javascript `Date` values into a
localized date string. Almost always used in conjunction with `parse`.

##### `formatOnBlur?: boolean`
If `true`, the `format` function will only be called when the field is blurred. If `false`, `format`
will be called on every update. Defaults to `false`.

##### `isEqual?: (a: any, b: any) => boolean`
[See the 🏁 Final Form docs on `isEqual`](https://github.com/final-form/final-form#isequal-a-any-b-any--boolean).

##### `name: string`
The name of your field. Field values may be deeply nested using dot-and-bracket syntax.
[Learn more about Field Names](https://github.com/final-form/final-form#field-names).

##### `parse?: ((value: any, name: string) => any) | null`
A function that takes the value from the input and name of the field and converts the value into
the value you want stored as this field's value in the form. Common usecases include converting
strings into `Number`s or parsing localized dates into actual javascript `Date` objects. Almost
always used in conjuction with `format`.

##### `subscription?: FieldSubscription`
A [`FieldSubscription`](https://github.com/final-form/final-form#fieldsubscription--string-boolean-)
that selects all of the items of [`FieldState`](https://github.com/final-form/final-form#fieldstate)
that you wish to update for. If you don't pass a `subscription` prop, it defaults to _all_ of
[`FieldState`](https://github.com/final-form/final-form#fieldstate).

##### `validate?: (value: ?any, allValues: Object, meta: FieldState) => ?any`
A function that takes the field value, all the values of the form and the `meta` data about the
field and returns an error if the value is invalid, or `undefined` if the value is valid.

##### `validateFields?: string[]`
[See the 🏁 Final Form docs on `validateFields`](https://github.com/final-form/final-form#validatefields-string).

#### `isForm(target: unknown): boolean`
[See the `@corpuscule/context` docs on `isProvider`](../context/README.md#isprovider-token-token-target-unknown--boolean).

### Advanced
Using a set of advanced decorators allows creating a new context that is completely independent of
the default one. It means that you can complex solutions like a form inside a form. 

#### How it works
[See `@copruscule/context` docs](../context/README.md#how-it-works).

#### `createFormToken(): Token`
The function creates a token to bind `@form`, `@field`, `@api` and `@option` together. To make a
connection, you have to send a token to all these decorators as an argument.

#### `@apiAdvanced(token: Token): PropertyDecorator`
[See default `@api` decorator](#api-propertydecorator).

#### `@formAdvanced(token: Token, options?: FormDecoratorOptions): ClassDecorator`
[See default `@form` decorator](#formoptions-formdecoratoroptions-classdecorator).

#### `@fieldAdvanced(token: Token, options?: FieldDecoratorOptions): ClassDecorator`
[See default `@field` decorator](#fieldoptions-fielddecoratoroptions-classdecorator).

#### `@optionAdvanced(token: Token): PropertyDecorator`
[See default `@option` decorator](#option-propertydecorator).

#### `isFormAdvanced(token: Token, target: unknown): boolean`
[See default `isForm` function](#isformtarget-unknown-boolean).

#### Example
##### [Simple Form](https://codesandbox.io/s/9j90pjrprw)
Uses the default inputs: `input`, `select`, and `textarea` to build a form with no validation.

##### [Synchronous Record-Level Validation](https://codesandbox.io/s/ol86m353kq)
Introduces a whole-record validation function and demonstrates how to use Field component to
display errors next to fields.

##### [Synchronous Field-Level Validation](https://codesandbox.io/s/wyx5l5vxlw)
Introduces field-level validation functions and demonstrates how to use Field component to
display errors next to fields.
