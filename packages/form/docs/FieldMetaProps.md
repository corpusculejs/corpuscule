# FieldMetaProps

```typescript
type FieldMetaProps<TFieldValue> = Omit<FieldOptions<TFieldValue>, 'name' | 'value'>;
```

Contains the internal field data that allows making decision about displaying
and interaction with the field. The values in meta are dependent on you having
subscribed to them via the [subscription](#subscription).

See [FieldOptions](./FieldOptions.md) type for details.
