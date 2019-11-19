# FieldInputProps

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
