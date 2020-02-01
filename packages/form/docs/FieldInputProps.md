# FieldInputProps

```typescript
interface FieldInputProps<FieldValue> {
  readonly name: string;
  readonly value: FieldValue;
}
```

Contains the general field data that can be provided directly to the
`HTMLInputElement`.

### Type Parameters

- **FieldValue** - a type of the current field value.

### Fields

#### name

**Type**: _string_

A name of the field.

#### value

**Type**: _[FieldValue](#type-parameters)_

A current value of the field.
