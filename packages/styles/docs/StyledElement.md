# StyledElement

```typescript
type StyledElement = {
  protected [stylesAttachedCallback]?(): void;
};
```

Each custom element marked with an [@styles](./index.md#styles) decorator
becomes an implementation of the `StyledElement` and gain the following
lifecycle.

| Name                                              | Hook Type  | Stage      | Description                                           |
| ------------------------------------------------- | ---------- | ---------- | ----------------------------------------------------- |
| [stylesAttachedCallback](#stylesattachedcallback) | Corpuscule | Connecting | Invoked once when all styles are successfully applied |

### Methods

#### stylesAttachedCallback

```typescript
() => void;
```

A method that is called when all styles are properly added. There are three
different timings it can fire:

- If the `URL` instance is used, it will fire after all CSS files are
  loaded.
- If the `HTMLStyleElement` is used and no `URL` instance exists, it will
  fire after the `<style>` tag is mounted.
- If nothing above is used, it will fire immediately after the
  `attachShadow` is called.

##### Parameters

None.

##### Returns

Nothing.
