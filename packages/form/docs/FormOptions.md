# FormOptions

```typescript
type FormOptions<TFormValues = object> = FormConfig<TFormValues> & {
  readonly compareInitialValues?: (prevInitialValues: object, nextInitialValues: object) => boolean;
};
```

See the [FormConfig](https://final-form.org/docs/final-form/types/Config)
documentation.

This interface is not necessary to be implemented because it covers only the
one case when all your properties are string and you do not plan to use
specific property names.

#### compareInitialValues

```
readonly compareInitialValues?: (prevInitialValues: object, nextInitialValues: object) => boolean;
```

Used to compare new initial values that are received by [initialValues](https://github.com/final-form/final-form#initialvalues-object)
option. By default the [shallowEqual](../../utils/docs/shallowEqual.md#shallowequal)
function.

##### Parameters

- `prevInitialValues` - object that contains previous set of initial values.
- `nextInitialValues` - object that contains current set of initial values.
