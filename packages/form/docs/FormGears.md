### FormGears

```typescript
type FormGears<TFormValues = object> = {
  readonly formApi: FormApi;
  readonly state: FormState<FormValues>;
};
```

This interface is not necessary to be implemented because it covers only the one
case when all your properties are string and you do not plan to use specific
property names.

#### formApi

```
readonly formApi: FormApi;
```

Contains a form instance and allows working with the [🏁 FinalForm API](https://final-form.org/docs/final-form/types/FormApi).

#### state

```
readonly state: FormState<FormValues>;
```

Contains [`FormState`](https://final-form.org/docs/final-form/types/FormState)
object. Is updated each time the form is changed.
