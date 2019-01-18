# `@corpuscule/form`
Lightweight set of decorators for providing solid form experience for web components. Works as a
connector to [🏁 Final Form](https://github.com/final-form/final-form).

## Features
* **Small**. Only [3.1Kb gzipped](https://bundlephobia.com/result?p=@corpuscule/form@0.6.1)
* **Typed**. [Typescript](http://www.typescriptlang.org/) typings are included.

## Installation
```bash
$ npm install --save @corpuscule/form
``` 
or
```bash
$ yarn add @corpuscule/form
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
#### `@form(params?: FormDecoratorParams): ClassDecorator`
Form decorator makes element a 🏁 FinalForm provider via [`@corpsucule/context`](../context) with
form instance as a context value. 

Decorator can receive `FormDecoratorParams` object which contains:
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

#### `@field(params?: FieldDecoratorParams): ClassDecorator`
Field decorator makes element a 🏁 FinalForm field, a consumer via [`@corpsucule/context`](../context)
with form instance as a context value.

Decorator can receive `FieldDecoratorParams` object which contains:
* `scheduler: (callback: () => void) => Promise<void>`. Function that performs scheduling for your
form element. Specifying scheduler is not required, [`@corpuscule/utils` scheduler](../utils/README.md#scheduler)
is used by default.

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

#### `createFormContext(): FormContext`
Function that creates new FormContext that contains following items:
* `api: PropertyDecorator` - `@api` decorator bound with the new context.
* `form(params?: FormDecoratorParams): ClassDecorator` - `@form` decorator bound with the new
context.
* `field(params?: FieldDecoratorParams): ClassDecorator` - `@field` decorator bound with the new
context.
* `option: PropertyDecorator` - `@option` decorator bound with the new context.

Created context is completely independent from the default context and can be used to create complex
structures like a form inside a form.  

#### Example
```html
<script type="module">
  import {api, form, field, option} from '@corpuscule/form';
  
  @form
  class MyForm extends HTMLElement {
    @api form;
    @api state;
    
    @option initialValues = {foo: 'bar'};
   
    constructor() {
      super();
      this.attachShadow({mode: 'open'});
    }
    
    connectedCallback() {
      this.shadowRoot.innerHTML = '<form><slot></slot></form>';
    }
    
    @option
    onSubmit(values) {
      console.log(values);
    }
  }
  customElements.define('my-form', MyForm);
  
  
  @field
  class MyField extends HTMLElement {
    @api form;
    @option name;
    
    #input;
    #meta;
    
    @api 
    get input() {
      return this.#input;
    };
    
    set input(input) {
      this.#input = input;
      this.inputElement.value = this.#input.value;
    }
    
    @api 
    get meta() {
      return this.#meta;
    };
    
    set meta(meta) {
      this.#meta = meta;
      
      if (this.#meta.touched && this.#meta.error) {
        this.errorElement.hidden = false;
        this.errorElement.textContent = meta.error;
      }
    }
    
    get errorElement() {
      return this.shadowRoot.querySelector('.error');
    }
    
    get inputElement() {
      return this.shadowRoot.querySelector('slot').assignedNodes()[0];
    }
   
    constructor() {
      super();
      this.attachShadow({mode: 'open'});
    }
    
    connectedCallback() {
      this.innerHTML = '<slot></slot><div class="error" hidden></div>';
      this.name = this.getAttribute('name');
    }
  }
  customElements.define('my-field', MyField);
</script>
<my-form>
  <my-field name="some-text">
    <input type="text"/>
  </my-field>
</my-form>
```