# FieldOptions

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
