# Constructor

```typescript
type Constructor<C, P extends object = Object, S extends object = {}> = {
  new (...args: any[]): C;
  readonly prototype: P;
} & S;
```

Represents a class definition that can have additional properties.

### Type Parameters

- **C** - a type of the instance the class definition creates.
- **P** - a type of the class prototype.
- **S** - an object type that contains additional static properties the class
  has.

