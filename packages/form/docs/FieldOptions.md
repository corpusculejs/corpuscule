# FieldOptions

```typescript
type FieldOptions<FieldValue> = Omit<
  FieldState<FieldValue>,
  'blur' | 'change' | 'focus' | 'length'
>;
```

This interface is not necessary to be implemented because it covers only the one
case when all your properties are string and you do not plan to use specific
property names.

##### Extends

- [FieldState](https://final-form.org/docs/final-form/types/FieldState) with
  omitting the following properties:
  - `blur`,
  - `change`,
  - `focus`,
  - `length`.

### Type Parameters

- **FieldValue** - a type of the current field value.
