# Exact

```typescript
type Exact<T extends U, U> = {
  [P in keyof T]: P extends keyof U ? T[P] : never;
};
```

A helper type that restricts the property set of `T` to the property set of `U`.

### Type Parameters

- **T**: U - a type that should be restricted.
- **U** - a sample type to which `T` should be restricted.

### Example

```typescript
// Here `objB` will be forced to have only the properties `objA` has.
function foo<A, B extends A>(objA: A, objB: Exact<B, A>);
```
