# FormDecoratorOptions

```typescript
type FormDecoratorOptions = {
  readonly decorators?: ReadonlyArray<Decorator>;
  readonly subscription?: Record<keyof FormState, boolean>;
};
```

### Fields

#### decorators <sub>[optional]</sub>

**Type**: **ReadonlyArray<[Decorator](https://final-form.org/docs/final-form/types/Decorator)>**

A list of 🏁 FinalForm decorators to apply to the form.

#### subscription <sub>[optional]</sub>

**Type**: _Record<keyof [FormState](https://final-form.org/docs/final-form/types/FormState), boolean>_

A list of form channels to notify when a part of the form is changed. If this
property is omitted, the subscription will be issued on all channels.
