# FormDecoratorOptions

```typescript
type FormDecoratorOptions = {
  readonly decorators?: ReadonlyArray<Decorator>;
  readonly subscription?: Record<keyof FormState, boolean>;
};
```

#### decorators

```
readonly decorators?: ReadonlyArray<Decorator>;
```

A list of [🏁 FinalForm decorators](https://final-form.org/docs/final-form/types/Decorator)
to apply to the form.

#### subscription

```
readonly subscription?: Record<keyof FormState, boolean>;
```

A list of form channels to notify when a part of the form is changed. All
channels are described in the [`FormState`](https://final-form.org/docs/final-form/types/FormState)
interface. If this property is omitted, the subscription will be issued on
all channels.
