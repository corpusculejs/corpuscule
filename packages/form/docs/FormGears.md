### FormGears

```typescript
type FormGears<FormValues = object> = {
  readonly formApi: FormApi;
  readonly state: FormState<FormValues>;
};
```

This interface is not necessary to be implemented because it covers only the one
case when all your properties are string and you do not plan to use specific
property names.

### Type Parameters

- **FormValues** - the list of field names associated with value types.

### Fields

#### formApi

**Type**: _[FormApi](https://final-form.org/docs/final-form/types/FormApi)_

Contains a form instance and allows working with the 🏁 FinalForm API.

#### state

**Type**: _[FormState](https://final-form.org/docs/final-form/types/FormState)_

Contains the `FormState` object. Is updated each time the form is changed.
