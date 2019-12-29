### FieldGears

```typescript
type FieldGears<FieldValue> = {
  readonly formApi: FormApi;
  readonly input: FieldInputProps<FieldValue>;
  readonly meta: FieldMetaProps<FieldValue>;
};
```

This type is not necessary to be implemented because it covers only the one case
when all your properties are string and you do not plan to use specific property
names.

### Type Parameters

- **FormValue** - a type of the current field value.

### Fields

#### formApi

**Type**: _[FormApi](https://final-form.org/docs/final-form/types/FormApi)_

Contains a form instance and allows working with the 🏁 FinalForm API.

#### input

**Type**: _[FieldInputProps](./FieldInputProps.md)_

#### meta

**Type**: _[FieldMetaProps](./FieldMetaProps.md)_
