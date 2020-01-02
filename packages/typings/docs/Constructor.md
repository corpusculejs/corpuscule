# Constructor

```typescript
type Constructor<Class, StaticProperties extends object = {}> = {
  new (...args: any[]): Class;
} & StaticProperties;
```

Represents a class definition that can have additional properties.

### Type Parameters

#### Class

A type of the instance the class definition creates.

#### StaticProperties

An object type that contains additional static properties the class has.
