# FormOptions

```typescript
type FormOptions<FormValues = object> = FormConfig<FormValues> & {
  readonly compareInitialValues?: (
    prevInitialValues: object,
    nextInitialValues: object,
  ) => boolean;
};
```

This type is not necessary to be implemented because it covers only the
one case when all your properties are string and you do not plan to use
specific property names.

##### Extends

- [FormConfig](https://final-form.org/docs/final-form/types/Config).

### Type Parameters

- **FormValues** - the list of field names associated with value types.

### Methods

#### compareInitialValues <sub>[optional]</sub>

```typescript
(prevInitialValues: object, nextInitialValues: object) => boolean;
```

Used to compare new initial values that are received by [initialValues](https://github.com/final-form/final-form#initialvalues-object)
option. By default the [shallowEqual](../../utils/docs/shallowEqual.md#shallowequal)
function.

##### Parameters

- **prevInitialValues**: _object_ - object that contains previous set of initial
  values.
- **nextInitialValues**: _object_ - object that contains current set of initial
  values.

##### Returns

**Type**: _boolean_

A result of comparison.
