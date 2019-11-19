# FieldDecoratorOptions

```typescript
type FieldDecoratorOptions = {
  readonly auto?: boolean;

  readonly childrenSelector?: string;

  readonly scheduler?: (task: () => void) => Promise<void>;
};
```

#### auto

```
readonly auto?: boolean;
```

Transforms a regular field to an auto field.

Auto fields are allowed not only to receive data comes up from native form
elements with change events but also to change these elements values by form
updates. It happens automatically and does not require specific actions from the
user.

#### childrenSelector

```
readonly childrenSelector?: string;
```

This option defines a selector for the `querySelectorAll` method that will be
used by an auto field to collect children form elements like `<input>`,
`<textarea>`, etc. in order to apply the form changes to them. By default, it is
`input, select, textarea`.

#### scheduler

```
readonly scheduler?: (task: () => void) => Promise<void>;
```

This option defines the function that schedules the re-subscription to the form
instance. It is necessary to avoid multiple subscriptions if several options
that require it are changed.

##### Parameters

- `task` - a callback that will be run at the scheduled time.
