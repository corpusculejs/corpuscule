# FieldMetaProps

```typescript
type FieldMetaProps<FieldValue> = Omit<
  FieldOptions<FieldValue>,
  'name' | 'value'
>;
```

Contains the internal field data that allows making decision about displaying
and interaction with the field. The values in meta are dependent on you having
subscribed to them via the [subscription](./FormDecoratorOptions.md#subscription).

##### Extends

- [FieldOptions](./FieldOptions.md) with omitting the following properties:
  - `name`,
  - `value`.

### Type Parameters

- **FieldValue** - a type of the current field value.
