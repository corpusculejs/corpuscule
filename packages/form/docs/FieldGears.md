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

See [FieldInputProps](./FieldInputProps.md) type for details.

#### meta

```
readonly meta: FieldMetaProps<TFieldValue>;
```

See [FieldMetaProps](./FieldMetaProps.md) type for details.
